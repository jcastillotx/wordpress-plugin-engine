import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, AlertCircle, Loader2, Database, Key, User, Shield, ExternalLink, Copy, Check } from 'lucide-react';
import { markSetupComplete } from '../lib/setupConfig';

type Step = 'welcome' | 'database' | 'testing' | 'migrations' | 'admin' | 'complete';
type SupabaseType = 'local' | 'cloud' | 'self-hosted' | null;

interface ConnectionTest {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  corsError?: boolean;
  supabaseType?: SupabaseType;
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
  const [copied, setCopied] = useState<string | null>(null);

  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const detectSupabaseType = (url: string): SupabaseType => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      if (hostname === 'localhost' || hostname === '127.0.0.1' || parsed.port === '54321') {
        return 'local';
      }

      if (hostname.includes('.supabase.co')) {
        return 'cloud';
      }

      return 'self-hosted';
    } catch {
      return null;
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setConnectionTest({ status: 'error', message: 'Please fill in all fields' });
      return;
    }

    const trimmedUrl = supabaseUrl.trim();

    if (!isValidUrl(trimmedUrl)) {
      setConnectionTest({
        status: 'error',
        message: 'Invalid URL format. Please enter a valid Supabase URL (e.g., https://your-project.supabase.co)'
      });
      return;
    }

    const supabaseType = detectSupabaseType(trimmedUrl);
    setConnectionTest({ status: 'testing', message: 'Testing connection...', supabaseType });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            supabaseUrl: trimmedUrl,
            supabaseKey: supabaseAnonKey.trim(),
            testType: 'connection',
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Connection failed');
      }

      setConnectionTest({
        status: 'success',
        message: result.message || 'Connection successful!',
        supabaseType
      });

      localStorage.setItem('VITE_SUPABASE_URL', trimmedUrl);
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', supabaseAnonKey.trim());

      setTimeout(() => setStep('testing'), 1500);
    } catch (error: any) {
      let errorMessage = 'Connection failed: ';

      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }

      setConnectionTest({
        status: 'error',
        message: errorMessage,
        corsError: false,
        supabaseType
      });
    }
  };

  const checkMigrations = async () => {
    setMigrationStatus('running');
    setMigrationMessage('Checking database setup...');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            supabaseUrl: supabaseUrl.trim(),
            supabaseKey: supabaseAnonKey.trim(),
            testType: 'migration',
          }),
        }
      );

      const result = await response.json();

      if (result.migrationNeeded) {
        setMigrationStatus('error');
        setMigrationMessage(result.message || 'Database tables not found. Please run migrations first.');
        return;
      }

      if (!result.success) {
        throw new Error(result.error || 'Database check failed');
      }

      setMigrationStatus('success');
      setMigrationMessage(result.message || 'Database is properly configured!');
      setTimeout(() => setStep('admin'), 1500);
    } catch (error: any) {
      let errorMessage = 'Database check failed: ';

      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }

      setMigrationStatus('error');
      setMigrationMessage(errorMessage);
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            supabaseUrl: supabaseUrl.trim(),
            supabaseKey: supabaseAnonKey.trim(),
            email: adminEmail,
            password: adminPassword,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create admin user');
      }

      if (result.warning) {
        console.warn(result.warning);
      }

      markSetupComplete(adminEmail);
      setStep('complete');
    } catch (error: any) {
      let errorMessage = 'Failed to create admin user: ';

      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }

      alert(errorMessage);
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

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-slate-900">Choose Your Supabase Setup:</h3>
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Database className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-slate-900">Supabase Cloud</h4>
                        <p className="text-xs text-slate-600 mt-1">Hosted by Supabase - easiest option with automatic CORS management</p>
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                        >
                          Get started <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Database className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-slate-900">Local Development</h4>
                        <p className="text-xs text-slate-600 mt-1">Run Supabase on your machine - perfect for development</p>
                        <a
                          href="https://supabase.com/docs/guides/cli/local-development"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 mt-1"
                        >
                          Setup guide <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <Database className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-slate-900">Self-Hosted</h4>
                        <p className="text-xs text-slate-600 mt-1">Deploy on your own infrastructure - full control</p>
                        <a
                          href="https://supabase.com/docs/guides/self-hosting"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-700 mt-1"
                        >
                          Deployment docs <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
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

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
                <h4 className="font-semibold text-slate-900">Example URLs:</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>Cloud: https://abc123xyz.supabase.co</li>
                  <li>Local: http://localhost:54321</li>
                  <li>Self-hosted: https://supabase.yourdomain.com</li>
                </ul>
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
                  <p className="text-xs text-slate-500 mt-1">
                    Find this in: Supabase Dashboard → Project Settings → API → Project URL
                  </p>
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
                  <p className="text-xs text-slate-500 mt-1">
                    Find this in: Supabase Dashboard → Project Settings → API → Project API keys → anon public
                  </p>
                </div>
              </div>

              {connectionTest.status !== 'idle' && (
                <div className="space-y-3">
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

                  {connectionTest.corsError && connectionTest.supabaseType && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-2">CORS Configuration Needed</h4>

                          {connectionTest.supabaseType === 'local' && (
                            <div className="space-y-3 text-sm text-slate-700">
                              <p>Your local Supabase needs to allow requests from this domain.</p>
                              <div>
                                <p className="font-medium mb-2">Option 1: Update config.toml (Recommended)</p>
                                <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-100 relative">
                                  <button
                                    onClick={() => copyToClipboard(`[api]\nadditional_redirect_urls = ["${window.location.origin}"]`, 'config1')}
                                    className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded"
                                  >
                                    {copied === 'config1' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                  <pre>[api]
additional_redirect_urls = ["{window.location.origin}"]</pre>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Add this to your supabase/config.toml and restart: supabase stop && supabase start</p>
                              </div>

                              <div>
                                <p className="font-medium mb-2">Option 2: Docker Override</p>
                                <p className="text-xs">Add to your docker-compose.yml under kong service:</p>
                                <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-100 relative mt-1">
                                  <button
                                    onClick={() => copyToClipboard(`KONG_CORS_ORIGINS: "${window.location.origin}"`, 'docker1')}
                                    className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded"
                                  >
                                    {copied === 'docker1' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                  <pre>KONG_CORS_ORIGINS: "{window.location.origin}"</pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {connectionTest.supabaseType === 'cloud' && (
                            <div className="space-y-3 text-sm text-slate-700">
                              <p>Configure CORS in your Supabase Dashboard:</p>
                              <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li>Go to your Supabase Dashboard</li>
                                <li>Navigate to Settings → API</li>
                                <li>Scroll to "URL Configuration"</li>
                                <li>Add this origin to allowed origins:
                                  <div className="bg-slate-900 rounded p-2 font-mono text-xs text-slate-100 relative mt-1">
                                    <button
                                      onClick={() => copyToClipboard(window.location.origin, 'origin1')}
                                      className="absolute top-1 right-1 p-1 hover:bg-slate-800 rounded"
                                    >
                                      {copied === 'origin1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    </button>
                                    {window.location.origin}
                                  </div>
                                </li>
                                <li>Save and try connecting again</li>
                              </ol>
                              <a
                                href="https://supabase.com/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Open Supabase Dashboard <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          )}

                          {connectionTest.supabaseType === 'self-hosted' && (
                            <div className="space-y-3 text-sm text-slate-700">
                              <p>Configure CORS on your self-hosted instance:</p>
                              <div>
                                <p className="font-medium mb-2">Add to Kong configuration:</p>
                                <div className="bg-slate-900 rounded p-3 font-mono text-xs text-slate-100 relative overflow-x-auto">
                                  <button
                                    onClick={() => copyToClipboard(`plugins:
  - name: cors
    config:
      origins:
        - ${window.location.origin}
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Authorization
        - Content-Type
        - X-Client-Info
      credentials: false
      max_age: 3600`, 'kong1')}
                                    className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded"
                                  >
                                    {copied === 'kong1' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  </button>
                                  <pre>{`plugins:
  - name: cors
    config:
      origins:
        - ${window.location.origin}
      methods:
        - GET
        - POST
        - PUT
        - PATCH
        - DELETE
        - OPTIONS
      headers:
        - Accept
        - Authorization
        - Content-Type
        - X-Client-Info
      credentials: false
      max_age: 3600`}</pre>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Restart Kong after updating: docker-compose restart kong</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
