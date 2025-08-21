import type { TimeObservation, StudyResults, WestinghouseFactors, ToleranceFactors } from '@/types';
import { 
  calculateAverageObservedTime, 
  calculateNormalTime, 
  calculateStandardTime 
} from '@/utils/timeCalculations';
import { googleSheetsService } from './googleSheetsService';

export class CalculationService {
  private static instance: CalculationService;

  private constructor() {}

  static getInstance(): CalculationService {
    if (!CalculationService.instance) {
      CalculationService.instance = new CalculationService();
    }
    return CalculationService.instance;
  }

  /**
   * Calculate standard times for a study
   */
  async calculateStudyResults(
    studyId: string,
    westinghouseFactors: WestinghouseFactors,
    tolerances: ToleranceFactors
  ): Promise<StudyResults[]> {
    try {
      // Read time observations from Google Sheets
      const observationsData = await googleSheetsService.readData('Tiempos_Observados');
      
      if (observationsData.length <= 1) {
        throw new Error('No time observations found for this study');
      }

      // Filter observations for this study and convert to TimeObservation objects
      const studyObservations: TimeObservation[] = observationsData
        .slice(1) // Skip header
        .filter((row: any[]) => row[0] === studyId)
        .map((row: any[]) => ({
          studyId: row[0],
          elementName: row[1] || '',
          cycleNumber: parseInt(row[2]) || 1,
          observedTime: parseFloat(row[3]) || 0,
          timestamp: new Date(row[4] || Date.now())
        }));

      if (studyObservations.length === 0) {
        throw new Error('No time observations found for this study');
      }

      // Group observations by element
      const elementGroups = new Map<string, TimeObservation[]>();
      studyObservations.forEach(obs => {
        if (!elementGroups.has(obs.elementName)) {
          elementGroups.set(obs.elementName, []);
        }
        elementGroups.get(obs.elementName)!.push(obs);
      });

      // Calculate results for each element
      const results: StudyResults[] = [];
      let totalStandardTime = 0;

      for (const [elementName, observations] of elementGroups) {
        const averageObservedTime = calculateAverageObservedTime(observations);
        const normalTime = calculateNormalTime(averageObservedTime, westinghouseFactors);
        const standardTime = calculateStandardTime(normalTime, tolerances);

        const result: StudyResults = {
          studyId,
          element: elementName,
          averageObservedTime,
          normalTime,
          standardTime,
          totalStandardTime: 0 // Will be set after calculating all elements
        };

        results.push(result);
        totalStandardTime += standardTime;
      }

      // Set total standard time for all results
      results.forEach(result => {
        result.totalStandardTime = totalStandardTime;
      });

      // Write results to Google Sheets
      await this.writeResultsToSheet(results);

      return results;
    } catch (error: any) {
      console.error('Calculation error:', error);
      throw new Error(`Failed to calculate study results: ${error.message}`);
    }
  }

  /**
   * Write calculation results to Google Sheets
   */
  private async writeResultsToSheet(results: StudyResults[]): Promise<void> {
    try {
      // Clear existing results for this study
      const existingData = await googleSheetsService.readData('Calculo_y_Resultados');
      const studyId = results[0]?.studyId;
      
      if (existingData.length > 1 && studyId) {
        // Find and remove existing results for this study
        // This is a simplified approach - in a real implementation, you might want to use the Sheets API's delete functionality
        const filteredData = existingData.filter((row: any[], index: number) => {
          if (index === 0) return true; // Keep header
          return row[0] !== studyId; // Remove rows with matching study ID
        });

        // If we removed any rows, we need to rewrite the entire sheet
        if (filteredData.length !== existingData.length) {
          // Clear the sheet and rewrite with filtered data
          await googleSheetsService.batchUpdate([
            {
              range: 'Calculo_y_Resultados!A:F',
              values: filteredData
            }
          ]);
        }
      }

      // Add new results
      for (const result of results) {
        const rowData = [
          result.studyId,
          result.element,
          result.averageObservedTime.toString(),
          result.normalTime.toString(),
          result.standardTime.toString(),
          result.totalStandardTime?.toString() || ''
        ];

        await googleSheetsService.writeData('Calculo_y_Resultados', rowData);
      }
    } catch (error: any) {
      console.error('Error writing results to sheet:', error);
      throw new Error(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * Read existing results for a study
   */
  async getStudyResults(studyId: string): Promise<StudyResults[]> {
    try {
      const data = await googleSheetsService.readData('Calculo_y_Resultados');
      
      if (data.length <= 1) {
        return [];
      }

      const results: StudyResults[] = data
        .slice(1) // Skip header
        .filter((row: any[]) => row[0] === studyId)
        .map((row: any[]) => ({
          studyId: row[0],
          element: row[1] || '',
          averageObservedTime: parseFloat(row[2]) || 0,
          normalTime: parseFloat(row[3]) || 0,
          standardTime: parseFloat(row[4]) || 0,
          totalStandardTime: parseFloat(row[5]) || 0
        }));

      return results;
    } catch (error: any) {
      console.error('Error reading results:', error);
      throw new Error(`Failed to read study results: ${error.message}`);
    }
  }

  /**
   * Check if a study has all required data for calculations
   */
  async canCalculateResults(studyId: string): Promise<{
    canCalculate: boolean;
    missingData: string[];
  }> {
    const missingData: string[] = [];

    try {
      // Check for time observations
      const observationsData = await googleSheetsService.readData('Tiempos_Observados');
      const hasObservations = observationsData.some((row: any[], index: number) => 
        index > 0 && row[0] === studyId
      );

      if (!hasObservations) {
        missingData.push('Time observations');
      }

      // Check for Westinghouse factors
      const studyData = await googleSheetsService.readData('Config_Estudios');
      const studyRow = studyData.find((row: any[], index: number) => 
        index > 0 && row[0] === studyId
      );

      if (!studyRow) {
        missingData.push('Study configuration');
      } else {
        // Check if Westinghouse factors are set (columns 5-8)
        const hasWestinghouse = studyRow[5] && studyRow[6] && studyRow[7] && studyRow[8];
        if (!hasWestinghouse) {
          missingData.push('Westinghouse evaluation');
        }

        // Check if tolerances are set (columns 9-11)
        const hasTolerances = studyRow[9] !== undefined && studyRow[10] !== undefined && studyRow[11] !== undefined;
        if (!hasTolerances) {
          missingData.push('Tolerance assignment');
        }
      }

      return {
        canCalculate: missingData.length === 0,
        missingData
      };
    } catch (error: any) {
      console.error('Error checking calculation requirements:', error);
      return {
        canCalculate: false,
        missingData: ['Error checking requirements']
      };
    }
  }
}

// Export singleton instance
export const calculationService = CalculationService.getInstance();