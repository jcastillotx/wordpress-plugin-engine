import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAdmin } from './hooks/useAdmin';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { NewPlugin } from './pages/NewPlugin';
import { MyPlugins } from './pages/MyPlugins';
import { Billing } from './pages/Billing';
import { Help } from './pages/Help';
import { DesignToCode } from './pages/DesignToCode';
import { MyConversions } from './pages/MyConversions';
import { Layout } from './components/layout/Layout';
import { AdminNavigation } from './components/admin/AdminNavigation';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminSubscriptions } from './pages/admin/AdminSubscriptions';
import { AdminPlugins } from './pages/admin/AdminPlugins';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminSettings } from './pages/admin/AdminSettings';
import Setup from './pages/Setup';
import { checkSetupComplete } from './lib/setupConfig';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help' | 'design-to-code' | 'conversions'>('dashboard');
  const [adminView, setAdminView] = useState<'dashboard' | 'subscriptions' | 'plugins' | 'pages' | 'settings'>('dashboard');
  const [setupComplete, setSetupComplete] = useState(checkSetupComplete());

  useEffect(() => {
    const isComplete = checkSetupComplete();
    setSetupComplete(isComplete);
  }, []);

  if (!setupComplete) {
    return <Setup />;
  }

  if (authLoading || adminLoading) {
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

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavigation currentView={adminView} onNavigate={setAdminView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {adminView === 'dashboard' && <AdminDashboard />}
          {adminView === 'subscriptions' && <AdminSubscriptions />}
          {adminView === 'plugins' && <AdminPlugins />}
          {adminView === 'pages' && <AdminPages />}
          {adminView === 'settings' && <AdminSettings />}
        </main>
      </div>
    );
  }

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'new-plugin' && <NewPlugin onSuccess={handlePluginSuccess} />}
      {currentView === 'plugins' && <MyPlugins />}
      {currentView === 'design-to-code' && <DesignToCode />}
      {currentView === 'conversions' && <MyConversions />}
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
