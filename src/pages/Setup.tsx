import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, AlertCircle, Loader2, Database, Key, User, Shield } from 'lucide-react';
import { markSetupComplete } from '../lib/setupConfig';

type Step = 'welcome' | 'database' | 'testing' | 'migrations' | 'admin' | 'complete';

interface ConnectionTest {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

export default function Setup() {
  const [step, setStep] = useState<Step>('welcome');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [connectionTest, setConnectionTest] = useState<ConnectionTest>({ status: 'idle' });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState('');

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionTest({ status: 'error', message: 'Please fill in all fields' });
      return;
    }

    setConnectionTest({ status: 'testing', message: 'Testing connection...' });

    try {
      const testClient = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await testClient.from('_test_').select('*').limit(1);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      setConnectionTest({ status: 'success', message: 'Connection successful!' });

      localStorage.setItem('VITE_SUPABASE_URL', supabaseUrl);
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

      setTimeout(() => setStep('testing'), 1500);
    } catch (error: any) {
      setConnectionTest({
        status: 'error',
        message: `Connection failed: ${error.message || 'Unknown error'}`
      });
    }
  };

  const checkMigrations = async () => {
    setMigrationStatus('running');
    setMigrationMessage('Checking database setup...');

    try {
      const testClient = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await testClient
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist') || error.code === 'PGRST204') {
          setMigrationStatus('error');
          setMigrationMessage('Database tables not found. Please run migrations first.');
          return;
        }
        throw error;
      }

      setMigrationStatus('success');
      setMigrationMessage('Database is properly configured!');
      setTimeout(() => setStep('admin'), 1500);
    } catch (error: any) {
      setMigrationStatus('error');
      setMigrationMessage(`Database check failed: ${error.message}`);
    }
  };

  const createAdminUser = async () => {
    if (!adminEmail || !adminPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (adminPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            role: 'admin',
            full_name: 'Admin'
          });

        if (profileError) {
          console.error('Profile creation failed:', profileError);

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Failed to set admin role:', updateError);
          }
        }
      }

      markSetupComplete(adminEmail);
      setStep('complete');
    } catch (error: any) {
      alert(`Failed to create admin user: ${error.message}`);
    }
  };

  const finishSetup = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Plugin Builder Setup</h1>
          <p className="text-blue-100">Let's get your application configured</p>
        </div>

        <div className="p-8">
          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Plugin Builder</h2>
                <p className="text-slate-600">
                  This setup wizard will guide you through configuring your application.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What you'll need:</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Supabase project URL and API keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Admin email and password for first user</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>About 5 minutes to complete setup</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setStep('database')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {step === 'database' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Database Connection</h2>
                <p className="text-slate-600 mb-6">
                  Enter your Supabase project credentials. You can find these in your Supabase project settings.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Supabase Anon Key
                  </label>
                  <textarea
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              {connectionTest.status !== 'idle' && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  connectionTest.status === 'success' ? 'bg-green-50 border border-green-200' :
                  connectionTest.status === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  {connectionTest.status === 'testing' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
                  {connectionTest.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                  {connectionTest.status === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <span className={`text-sm ${
                    connectionTest.status === 'success' ? 'text-green-800' :
                    connectionTest.status === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {connectionTest.message}
                  </span>
                </div>
              )}

              <button
                onClick={testConnection}
                disabled={connectionTest.status === 'testing' || !supabaseUrl || !supabaseAnonKey}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {connectionTest.status === 'testing' ? 'Testing Connection...' : 'Test Connection'}
              </button>
            </div>
          )}

          {step === 'testing' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Connection Successful!</h2>
                <p className="text-slate-600 mb-6">
                  Your database is ready. Next, we'll set up the database tables.
                </p>
              </div>

              <button
                onClick={() => setStep('migrations')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continue to Database Setup
              </button>
            </div>
          )}

          {step === 'migrations' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Database Setup</h2>
                <p className="text-slate-600 mb-4">
                  Now we need to set up the database tables and security policies.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Run Migrations</h3>
                <p className="text-sm text-slate-700 mb-3">
                  Before continuing, run the following commands on your server:
                </p>
                <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-100 overflow-x-auto">
                  <div>npm install -g supabase</div>
                  <div>supabase db push --db-url "your-database-url"</div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Replace "your-database-url" with your PostgreSQL connection string
                </p>
              </div>

              {migrationStatus !== 'idle' && (
                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  migrationStatus === 'success' ? 'bg-green-50 border border-green-200' :
                  migrationStatus === 'error' ? 'bg-red-50 border border-red-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  {migrationStatus === 'running' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
                  {migrationStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                  {migrationStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div className={`text-sm ${
                    migrationStatus === 'success' ? 'text-green-800' :
                    migrationStatus === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {migrationMessage}
                    {migrationStatus === 'error' && (
                      <div className="mt-2 text-xs">
                        Make sure you've run the migration commands above, then try again.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={checkMigrations}
                disabled={migrationStatus === 'running'}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {migrationStatus === 'running' ? 'Checking Database...' : 'Verify Database Setup'}
              </button>
            </div>
          )}

          {step === 'admin' && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Create Admin Account</h2>
                <p className="text-slate-600 mb-6">
                  Create your administrator account to manage the application.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long</p>
                </div>
              </div>

              <button
                onClick={createAdminUser}
                disabled={!adminEmail || !adminPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Create Admin Account
              </button>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Setup Complete!</h2>
              <p className="text-slate-600 text-lg">
                Your Plugin Builder application is now ready to use.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-slate-900 mb-3">What's Next?</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <User className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>Log in with your admin credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>Start building your first plugin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-600" />
                    <span>Configure your application settings</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={finishSetup}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Go to Application
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
