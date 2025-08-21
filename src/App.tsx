import { useAuthStore } from '@/stores/authStore';

import LoginScreen from '@/components/auth/LoginScreen';
import GoogleSheetSetup from '@/components/auth/GoogleSheetSetup';
import AppLayout from '@/components/layout/AppLayout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { useState } from 'react';

// --- Componentes de Vista (Ejemplos) ---
// Deberías reemplazar estos con tus componentes reales
const Dashboard = () => <div>Dashboard View</div>;
const MasterDataManager = () => <div>Master Data Manager View</div>;
const TimeStudyManager = () => <div>Time Study Manager View</div>;
const PerformanceEvaluation = () => <div>Performance Evaluation View</div>;
const ResultsDashboard = () => <div>Results Dashboard View</div>;
const DAPBuilder = () => <div>DAP Builder View</div>;
// -----------------------------------------


function App() {
  // Obtenemos el estado directamente del store.
  const { isAuthenticated, sheetsConfig } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');

  // Ya no necesitamos el estado 'isInitialized' porque el LoginScreen
  // se encarga de su propia lógica de carga.

  // 1. Si el usuario NO está autenticado, mostramos la pantalla de login.
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <OfflineIndicator />
        <LoginScreen />
      </ErrorBoundary>
    );
  }

  // 2. Si el usuario SÍ está autenticado, pero NO ha configurado su hoja de cálculo.
  if (!sheetsConfig) {
    return (
      <ErrorBoundary>
        <OfflineIndicator />
        <GoogleSheetSetup />
      </ErrorBoundary>
    );
  }

  // 3. Si el usuario está autenticado Y ha configurado su hoja, mostramos la app principal.
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'masters':
        return <MasterDataManager />;
      case 'study':
        return <TimeStudyManager />;
      case 'evaluation':
        return <PerformanceEvaluation />;
      case 'results':
        return <ResultsDashboard />;
      case 'dap':
        return <DAPBuilder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <AppLayout currentView={currentView} onViewChange={setCurrentView}>
        {renderCurrentView()}
      </AppLayout>
    </ErrorBoundary>
  );
}

export default App;
