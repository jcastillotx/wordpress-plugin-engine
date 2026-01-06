import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { NewPlugin } from './pages/NewPlugin';
import { MyPlugins } from './pages/MyPlugins';
import { Billing } from './pages/Billing';
import { Help } from './pages/Help';
import { Layout } from './components/layout/Layout';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handlePluginSuccess = () => {
    setCurrentView('plugins');
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'new-plugin' && <NewPlugin onSuccess={handlePluginSuccess} />}
      {currentView === 'plugins' && <MyPlugins />}
      {currentView === 'billing' && <Billing />}
      {currentView === 'help' && <Help />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
