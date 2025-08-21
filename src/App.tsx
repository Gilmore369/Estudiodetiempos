
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

import LoginScreen from '@/components/auth/LoginScreen';
import GoogleSheetSetup from '@/components/auth/GoogleSheetSetup';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/Dashboard';
import MasterDataManager from '@/components/masters/MasterDataManager';
import TimeStudyManager from '@/components/study/TimeStudyManager';
import PerformanceEvaluation from '@/components/evaluation/PerformanceEvaluation';
import ResultsDashboard from '@/components/results/ResultsDashboard';
import DAPBuilder from '@/components/dap/DAPBuilder';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OfflineIndicator from '@/components/common/OfflineIndicator';

function App() {
  const { isAuthenticated, sheetsConfig, initialize } = useAuthStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize the app
    initialize().finally(() => {
      setIsInitialized(true);
    });
  }, [initialize]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Standard Time Pro...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <OfflineIndicator />
        <LoginScreen />
      </ErrorBoundary>
    );
  }

  // Show Google Sheets setup if not configured
  if (!sheetsConfig) {
    return (
      <ErrorBoundary>
        <OfflineIndicator />
        <GoogleSheetSetup onComplete={() => {
          // Configuration completed, the store will be updated automatically
        }} />
      </ErrorBoundary>
    );
  }

  // Show main application
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
