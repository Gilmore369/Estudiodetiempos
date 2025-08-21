import { useState, useEffect } from 'react';
import { useStudyStore } from '@/stores/studyStore';
import { calculationService } from '@/services/calculationService';
import { formatTime } from '@/utils/timeCalculations';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { StudyResults } from '@/types';

export default function ResultsDashboard() {
  const { activeStudy } = useStudyStore();
  const [results, setResults] = useState<StudyResults[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canCalculate, setCanCalculate] = useState(false);
  const [missingData, setMissingData] = useState<string[]>([]);

  useEffect(() => {
    if (activeStudy) {
      loadResults();
      checkCalculationRequirements();
    } else {
      setResults([]);
      setCanCalculate(false);
      setMissingData([]);
    }
  }, [activeStudy]);

  const loadResults = async () => {
    if (!activeStudy) return;

    setIsLoading(true);
    setError(null);

    try {
      const studyResults = await calculationService.getStudyResults(activeStudy.id);
      setResults(studyResults);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const checkCalculationRequirements = async () => {
    if (!activeStudy) return;

    try {
      const requirements = await calculationService.canCalculateResults(activeStudy.id);
      setCanCalculate(requirements.canCalculate);
      setMissingData(requirements.missingData);
    } catch (err: any) {
      console.error('Error checking requirements:', err);
      setCanCalculate(false);
      setMissingData(['Error checking requirements']);
    }
  };

  const handleCalculate = async () => {
    if (!activeStudy || !activeStudy.westinghouseFactors || !activeStudy.tolerances) {
      setError('Missing evaluation data. Please complete Westinghouse evaluation and tolerance assignment.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const calculatedResults = await calculationService.calculateStudyResults(
        activeStudy.id,
        activeStudy.westinghouseFactors,
        activeStudy.tolerances
      );
      setResults(calculatedResults);
      setCanCalculate(true);
      setMissingData([]);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate results');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeStudy) {
    return (
      <div className="card text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Study</h2>
        <p className="text-gray-600">Please select a study to view results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Results</h2>
          <p className="text-gray-600">Standard time calculations and analysis</p>
        </div>
        
        {canCalculate && (
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Calculating...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculate Results
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Study ID:</span>
            <span className="ml-2 text-gray-600">{activeStudy.id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Process:</span>
            <span className="ml-2 text-gray-600">{activeStudy.processId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Collaborator:</span>
            <span className="ml-2 text-gray-600">{activeStudy.collaboratorId}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Analyst:</span>
            <span className="ml-2 text-gray-600">{activeStudy.analyst}</span>
          </div>
        </div>

        {/* Evaluation Factors */}
        {(activeStudy.westinghouseFactors || activeStudy.tolerances) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeStudy.westinghouseFactors && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Westinghouse Factors:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Factor:</span>
                    <span className="font-mono">{activeStudy.westinghouseFactors.total.toFixed(3)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeStudy.tolerances && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tolerances:</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Total Tolerance:</span>
                    <span className="font-mono">{activeStudy.tolerances.total.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Missing Data Warning */}
      {!canCalculate && missingData.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Missing Data for Calculations</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Complete the following before calculating results:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {missingData.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Calculation Results</h3>
            <button
              onClick={() => window.print()}
              className="btn-secondary text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Element
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TO Average (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Normal Time (min)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standard Time (min)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.element}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatTime(result.averageObservedTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatTime(result.normalTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatTime(result.standardTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 font-mono">
                    {results.length > 0 && formatTime(results[0].totalStandardTime || 0)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Total Elements:</span>
                <span className="ml-2 text-blue-700">{results.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Total Standard Time:</span>
                <span className="ml-2 text-blue-700 font-mono">
                  {results.length > 0 && formatTime(results[0].totalStandardTime || 0)}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Calculated:</span>
                <span className="ml-2 text-blue-700">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : !isLoading && canCalculate && (
        <div className="card text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Results Calculated</h3>
          <p className="mt-1 text-sm text-gray-500">Click "Calculate Results" to generate standard time calculations.</p>
        </div>
      )}

      {isLoading && (
        <div className="card">
          <LoadingSpinner className="py-8" />
          <p className="text-center text-gray-600 mt-4">Calculating results...</p>
        </div>
      )}
    </div>
  );
}