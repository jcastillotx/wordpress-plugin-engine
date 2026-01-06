import { ReactNode } from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help';
  onNavigate: (view: 'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help') => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
