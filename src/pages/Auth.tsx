import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { Code2 } from 'lucide-react';

export function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Code2 className="w-12 h-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-800">WP Plugin Builder</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Build custom WordPress plugins with AI
        </p>
      </div>

      {mode === 'login' ? (
        <LoginForm onToggleMode={() => setMode('signup')} />
      ) : (
        <SignupForm onToggleMode={() => setMode('login')} />
      )}
    </div>
  );
}
