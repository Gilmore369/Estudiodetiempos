import type { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';

interface AppLayoutProps {
  children: ReactNode;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export default function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={onViewChange} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}