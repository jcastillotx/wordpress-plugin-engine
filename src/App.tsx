import { useState } from 'react';
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
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminPlugins } from './pages/admin/AdminPlugins';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminIntegrations } from './pages/admin/AdminIntegrations';
import { AdminSettings } from './pages/admin/AdminSettings';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help' | 'design-to-code' | 'conversions'>('dashboard');
  const [adminView, setAdminView] = useState<'dashboard' | 'subscriptions' | 'pricing' | 'plugins' | 'pages' | 'integrations' | 'settings'>('dashboard');

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
          {adminView === 'pricing' && <AdminPricing />}
          {adminView === 'plugins' && <AdminPlugins />}
          {adminView === 'pages' && <AdminPages />}
          {adminView === 'integrations' && <AdminIntegrations />}
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
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { SubscriptionStatus } from './components/subscription/SubscriptionStatus';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Pricing } from './pages/Pricing';
import { Success } from './pages/Success';
import { signOut } from './lib/auth';
import { LogOut, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">WP Plugin Builder</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SubscriptionStatus />
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to WP Plugin Builder
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create custom WordPress plugins with AI-powered generation. 
            Build exactly what you need with advanced features and premium support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Generation</h3>
            <p className="text-gray-600">
              Describe your plugin requirements and let our AI create custom WordPress plugins tailored to your needs.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Theme Compatibility</h3>
            <p className="text-gray-600">
              Ensure your plugins work seamlessly with popular WordPress themes and page builders.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Support</h3>
            <p className="text-gray-600">
              Get dedicated support and priority assistance for all your plugin development needs.
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/pricing"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            View Pricing Plans
          </a>
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/success" element={<Success />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}