import { Code2, LayoutDashboard, Users, Package, CreditCard, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminNavigationProps {
  currentView: 'dashboard' | 'subscriptions' | 'plugins' | 'pages' | 'settings';
  onNavigate: (view: 'dashboard' | 'subscriptions' | 'plugins' | 'pages' | 'settings') => void;
}

export function AdminNavigation({ currentView, onNavigate }: AdminNavigationProps) {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
    { id: 'plugins' as const, label: 'All Plugins', icon: Package },
    { id: 'pages' as const, label: 'Pages', icon: FileText },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <Code2 className="w-8 h-8 text-blue-400 mr-2" />
              <div>
                <span className="text-xl font-bold text-white">WP Plugin Builder</span>
                <span className="ml-2 text-xs px-2 py-1 bg-blue-600 text-white rounded-full">ADMIN</span>
              </div>
            </div>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={signOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
