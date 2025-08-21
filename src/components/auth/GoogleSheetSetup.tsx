import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
// Asumo que estos servicios y utilidades existen según tu código
// import { googleSheetsService } from '@/services/googleSheetsService';
// import { isValidGoogleSheetsUrl } from '@/utils/validators';

// --- PLACEHOLDER - Reemplaza con tus servicios y utilidades reales ---
// Para que el código sea funcional, creo placeholders de tus importaciones.
const isValidGoogleSheetsUrl = (url: string) => /spreadsheets\/d\/[a-zA-Z0-9-_]+/.test(url);
const googleSheetsService = {
  setupWorkbook: async (url?: string) => {
    console.log('Setting up workbook with URL:', url);
    // Simula una llamada a la API
    return new Promise(resolve => setTimeout(resolve, 1500));
  },
  getConfig: () => ({ sheetId: 'mock-sheet-id-from-service' }),
};
// ----------------------------------------------------------------

// Tipos para las props de los sub-componentes
type ViewProps = {
  setMode: (mode: 'choose' | 'existing' | 'new') => void;
  handleAction: (url?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

// --- Sub-componente para la vista de "Elegir Opción" ---
const ChooseModeView = ({ setMode }: { setMode: ViewProps['setMode'] }) => (
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
              We'll create a new Google Sheet with all the required tabs for your time studies.
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
);

// --- Sub-componente para la vista de "Hoja Existente" ---
const ExistingSheetView = ({ setMode, handleAction, isLoading, error }: ViewProps) => {
  const [sheetUrl, setSheetUrl] = useState('');
  return (
    <div className="card">
      {error && <div className="error-banner">{error}</div>}
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
          Make sure the spreadsheet is shared with your Google account.
        </p>
      </div>
      <div className="flex space-x-3">
        <button onClick={() => setMode('choose')} disabled={isLoading} className="btn-secondary flex-1">
          Back
        </button>
        <button onClick={() => handleAction(sheetUrl)} disabled={isLoading || !sheetUrl.trim()} className="btn-primary flex-1">
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

// --- Sub-componente para la vista de "Hoja Nueva" ---
const NewSheetView = ({ setMode, handleAction, isLoading, error }: ViewProps) => (
  <div className="card">
    {error && <div className="error-banner">{error}</div>}
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">What will be created:</h3>
      <ul className="text-sm text-gray-600 space-y-2">
        {['Config_Estudios', 'DB_Colaboradores', 'DB_Procesos', 'Tiempos_Observados', 'Calculo_y_Resultados', 'DAP_Data'].map(tab => (
          <li key={tab} className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {tab}
          </li>
        ))}
      </ul>
    </div>
    <div className="flex space-x-3">
      <button onClick={() => setMode('choose')} disabled={isLoading} className="btn-secondary flex-1">
        Back
      </button>
      <button onClick={() => handleAction()} disabled={isLoading} className="btn-primary flex-1">
        {isLoading ? 'Creating...' : 'Create Spreadsheet'}
      </button>
    </div>
  </div>
);


// --- Componente Principal ---
export default function GoogleSheetSetup() {
  const [mode, setMode] = useState<'choose' | 'existing' | 'new'>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userProfile, setSheetsConfig } = useAuthStore();

  const titles = {
    choose: { title: 'Setup Google Sheets', subtitle: 'Choose how you want to store your data' },
    existing: { title: 'Connect Existing Sheet', subtitle: 'Enter the URL of your document' },
    new: { title: 'Create New Spreadsheet', subtitle: "We'll create a new sheet with all required tabs" },
  };

  const handleAction = async (sheetUrl?: string) => {
    setIsLoading(true);
    setError(null);

    // Validar URL solo si estamos en modo 'existing'
    if (mode === 'existing') {
        if (!sheetUrl || !sheetUrl.trim()) {
            setError('Please enter a Google Sheets URL');
            setIsLoading(false);
            return;
        }
        if (!isValidGoogleSheetsUrl(sheetUrl)) {
            setError('Please enter a valid Google Sheets URL');
            setIsLoading(false);
            return;
        }
    }

    try {
      // Llamamos al servicio con o sin URL dependiendo del modo
      await googleSheetsService.setupWorkbook(sheetUrl);
      const config = googleSheetsService.getConfig();
      
      if (config) {
        setSheetsConfig(config);
        // El App.tsx se encargará de cambiar la vista automáticamente
      } else {
        throw new Error("Configuration could not be retrieved after setup.");
      }
    } catch (err: any) {
      const errorMessage = mode === 'new' ? 'Failed to create new Google Sheet' : 'Failed to setup Google Sheet';
      setError(err.message || errorMessage);
      console.error('Sheet setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    const viewProps = { setMode, handleAction, isLoading, error };
    switch (mode) {
      case 'existing':
        return <ExistingSheetView {...viewProps} />;
      case 'new':
        return <NewSheetView {...viewProps} />;
      case 'choose':
      default:
        return <ChooseModeView setMode={setMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userProfile?.name}!
          </h1>
          <p className="text-gray-600">{titles[mode].title}</p>
          <p className="text-sm text-gray-500">{titles[mode].subtitle}</p>
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {renderContent()}
      </div>
    </div>
  );
}
