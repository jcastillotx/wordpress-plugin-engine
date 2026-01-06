import { Code2, LayoutDashboard, Plus, Package, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  currentView: 'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help';
  onNavigate: (view: 'dashboard' | 'new-plugin' | 'plugins' | 'billing' | 'help') => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { signOut } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-plugin' as const, label: 'New Plugin', icon: Plus },
    { id: 'plugins' as const, label: 'My Plugins', icon: Package },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'help' as const, label: 'Help', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <Code2 className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">WP Plugin Builder</span>
            </div>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
