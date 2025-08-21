import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { googleSheetsService } from '@/services/googleSheetsService';
import { isValidGoogleSheetsUrl } from '@/utils/validators';

interface GoogleSheetSetupProps {
  onComplete: () => void;
}

export default function GoogleSheetSetup({ onComplete }: GoogleSheetSetupProps) {
  const [mode, setMode] = useState<'choose' | 'existing' | 'new'>('choose');
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSheetsConfig } = useAuthStore();

  const handleExistingSheet = async () => {
    if (!sheetUrl.trim()) {
      setError('Please enter a Google Sheets URL');
      return;
    }

    if (!isValidGoogleSheetsUrl(sheetUrl)) {
      setError('Please enter a valid Google Sheets URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await googleSheetsService.setupWorkbook(sheetUrl);
      const config = googleSheetsService.getConfig();
      
      if (config) {
        setSheetsConfig(config);
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup Google Sheet');
      console.error('Sheet setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSheet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await googleSheetsService.setupWorkbook();
      const config = googleSheetsService.getConfig();
      
      if (config) {
        setSheetsConfig(config);
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create new Google Sheet');
      console.error('Sheet creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Setup Google Sheets
            </h1>
            <p className="text-gray-600">
              Choose how you want to store your time study data
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card">
            <div className="space-y-4">
              <button
                onClick={() => setMode('new')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Create New Spreadsheet</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll create a new Google Sheet with all the required tabs and headers for your time studies.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode('existing')}
                className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">Use Existing Spreadsheet</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect to an existing Google Sheet. We'll add the required tabs if they don't exist.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'existing') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Existing Sheet
            </h1>
            <p className="text-gray-600">
              Enter the URL of your Google Sheets document
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="sheetUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheets URL
              </label>
              <input
                type="url"
                id="sheetUrl"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="input-field"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Make sure the spreadsheet is shared with your Google account
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setMode('choose')}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleExistingSheet}
                disabled={isLoading || !sheetUrl.trim()}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'new') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Spreadsheet
            </h1>
            <p className="text-gray-600">
              We'll create a new Google Sheet with all required tabs
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                What will be created:
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Config_Estudios - Study configurations
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  DB_Colaboradores - Worker database
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  DB_Procesos - Process database
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Tiempos_Observados - Time observations
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Calculo_y_Resultados - Calculations
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  DAP_Data - Process analysis diagrams
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setMode('choose')}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={handleNewSheet}
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Spreadsheet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}