import type { BatchUpdate, GoogleSheetsConfig } from '@/types';
import { authService } from './authService';
import { extractSpreadsheetId, isValidGoogleSheetsUrl } from '@/utils/validators';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private config: GoogleSheetsConfig | null = null;

  private constructor() {}

  static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  /**
   * Set the Google Sheets configuration
   */
  setConfig(config: GoogleSheetsConfig): void {
    this.config = config;
    localStorage.setItem('google_sheets_config', JSON.stringify(config));
  }

  /**
   * Get the current configuration
   */
  getConfig(): GoogleSheetsConfig | null {
    if (this.config) return this.config;

    const stored = localStorage.getItem('google_sheets_config');
    if (stored) {
      this.config = JSON.parse(stored);
    }
    return this.config;
  }

  /**
   * Setup workbook - validate URL and create required sheets
   */
  async setupWorkbook(sheetUrl?: string): Promise<string> {
    if (!sheetUrl) {
      // Create new spreadsheet
      return await this.createNewSpreadsheet();
    }

    if (!isValidGoogleSheetsUrl(sheetUrl)) {
      throw new Error('Invalid Google Sheets URL');
    }

    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      throw new Error('Could not extract spreadsheet ID from URL');
    }

    // Validate access to the spreadsheet
    await this.validateSpreadsheetAccess(spreadsheetId);

    // Create required sheets if they don't exist
    await this.ensureRequiredSheets(spreadsheetId);

    // Store configuration
    const config: GoogleSheetsConfig = {
      spreadsheetId,
      sheetUrl,
      accessToken: authService.getAccessToken()!,
      refreshToken: ''
    };

    this.setConfig(config);
    return spreadsheetId;
  }

  /**
   * Create a new spreadsheet with required sheets
   */
  private async createNewSpreadsheet(): Promise<string> {
    const accessToken = await authService.ensureValidToken();

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `Standard Time Pro - ${new Date().toLocaleDateString()}`
        },
        sheets: [
          { properties: { title: 'Config_Estudios' } },
          { properties: { title: 'DB_Colaboradores' } },
          { properties: { title: 'DB_Procesos' } },
          { properties: { title: 'Tiempos_Observados' } },
          { properties: { title: 'Calculo_y_Resultados' } },
          { properties: { title: 'DAP_Data' } }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create spreadsheet: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const spreadsheetId = data.spreadsheetId;
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // Initialize headers for each sheet
    await this.initializeSheetHeaders(spreadsheetId);

    // Store configuration
    const config: GoogleSheetsConfig = {
      spreadsheetId,
      sheetUrl,
      accessToken,
      refreshToken: ''
    };

    this.setConfig(config);
    return spreadsheetId;
  }

  /**
   * Validate access to existing spreadsheet
   */
  private async validateSpreadsheetAccess(spreadsheetId: string): Promise<void> {
    const accessToken = await authService.ensureValidToken();

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Please ensure the spreadsheet is shared with your account.');
      } else if (response.status === 404) {
        throw new Error('Spreadsheet not found. Please check the URL.');
      } else {
        throw new Error('Failed to access spreadsheet.');
      }
    }
  }

  /**
   * Ensure all required sheets exist
   */
  private async ensureRequiredSheets(spreadsheetId: string): Promise<void> {
    const requiredSheets = [
      'Config_Estudios',
      'DB_Colaboradores', 
      'DB_Procesos',
      'Tiempos_Observados',
      'Calculo_y_Resultados',
      'DAP_Data'
    ];

    // Get existing sheets
    const accessToken = await authService.ensureValidToken();
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();
    const existingSheets = data.sheets.map((sheet: any) => sheet.properties.title);

    // Create missing sheets
    const missingSheets = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
    
    if (missingSheets.length > 0) {
      await this.createMissingSheets(spreadsheetId, missingSheets);
      await this.initializeSheetHeaders(spreadsheetId);
    }
  }

  /**
   * Create missing sheets
   */
  private async createMissingSheets(spreadsheetId: string, sheetNames: string[]): Promise<void> {
    const accessToken = await authService.ensureValidToken();

    const requests = sheetNames.map(title => ({
      addSheet: {
        properties: { title }
      }
    }));

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create sheets: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Initialize headers for all sheets
   */
  private async initializeSheetHeaders(_spreadsheetId: string): Promise<void> {
    const headerData = [
      {
        range: 'Config_Estudios!A1:L1',
        values: [['ID_Estudio', 'Proceso', 'Colaborador', 'Analista', 'Fecha', 'Habilidad', 'Esfuerzo', 'Condiciones', 'Consistencia', 'Tolerancia_Personal', 'Tolerancia_Fatiga', 'Tolerancia_Otros']]
      },
      {
        range: 'DB_Colaboradores!A1:F1',
        values: [['ID', 'Nombre', 'Departamento', 'Posicion', 'Experiencia', 'Fecha_Creacion']]
      },
      {
        range: 'DB_Procesos!A1:F1',
        values: [['ID', 'Nombre', 'Descripcion', 'Departamento', 'Recursos', 'Fecha_Creacion']]
      },
      {
        range: 'Tiempos_Observados!A1:E1',
        values: [['ID_Estudio', 'Nombre_Elemento', 'Numero_Ciclo', 'Tiempo_Registrado', 'Timestamp']]
      },
      {
        range: 'Calculo_y_Resultados!A1:F1',
        values: [['ID_Estudio', 'Elemento', 'TO_Promedio', 'TN', 'TE', 'TE_Total']]
      },
      {
        range: 'DAP_Data!A1:G1',
        values: [['ID_Estudio', 'Secuencia', 'Tipo_Actividad', 'Descripcion', 'Distancia', 'Tiempo', 'Timestamp']]
      }
    ];

    await this.batchUpdate(headerData);
  }

  /**
   * Write data to a specific sheet
   */
  async writeData(sheet: string, data: any[]): Promise<void> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    const accessToken = await authService.ensureValidToken();
    const range = `${sheet}!A:Z`; // Use full range to append

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${range}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [data]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to write data: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Read data from a specific sheet
   */
  async readData(sheet: string, range?: string): Promise<any[]> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    const accessToken = await authService.ensureValidToken();
    const fullRange = range ? `${sheet}!${range}` : `${sheet}!A:Z`;

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${fullRange}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to read data: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.values || [];
  }

  /**
   * Batch update multiple ranges
   */
  async batchUpdate(updates: BatchUpdate[]): Promise<void> {
    if (!this.config) {
      throw new Error('Google Sheets not configured');
    }

    const accessToken = await authService.ensureValidToken();

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: updates.map(update => ({
            range: update.range,
            values: update.values
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to batch update: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update specific row by ID
   */
  async updateRowById(sheet: string, idColumn: string, id: string, data: any[]): Promise<void> {
    // First, find the row with the matching ID
    const allData = await this.readData(sheet);
    const headers = allData[0] || [];
    const idColumnIndex = headers.indexOf(idColumn);

    if (idColumnIndex === -1) {
      throw new Error(`Column ${idColumn} not found in sheet ${sheet}`);
    }

    // Find the row index
    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] === id) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Row with ${idColumn} = ${id} not found`);
    }

    // Update the specific row
    const range = `${sheet}!A${rowIndex}:Z${rowIndex}`;
    await this.batchUpdate([{ range, values: [data] }]);
  }

  /**
   * Delete row by ID
   */
  async deleteRowById(sheet: string, idColumn: string, id: string): Promise<void> {
    // This is a simplified implementation - in a real scenario,
    // you might want to use the Sheets API's delete row functionality
    // For now, we'll clear the row content
    const allData = await this.readData(sheet);
    const headers = allData[0] || [];
    const idColumnIndex = headers.indexOf(idColumn);

    if (idColumnIndex === -1) {
      throw new Error(`Column ${idColumn} not found in sheet ${sheet}`);
    }

    let rowIndex = -1;
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idColumnIndex] === id) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Row with ${idColumn} = ${id} not found`);
    }

    // Clear the row by setting empty values
    const emptyRow = new Array(headers.length).fill('');
    const range = `${sheet}!A${rowIndex}:Z${rowIndex}`;
    await this.batchUpdate([{ range, values: [emptyRow] }]);
  }
}

// Export singleton instance
export const googleSheetsService = GoogleSheetsService.getInstance();