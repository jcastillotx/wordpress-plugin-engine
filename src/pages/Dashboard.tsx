import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, CheckCircle, AlertCircle, Rocket } from 'lucide-react';

interface Profile {
  full_name: string;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

interface Stats {
  totalPlugins: number;
  pendingPlugins: number;
  completedPlugins: number;
}

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalPlugins: 0, pendingPlugins: 0, completedPlugins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: pluginRequests } = await supabase
      .from('plugin_requests')
      .select('status')
      .eq('user_id', user.id);

    if (pluginRequests) {
      setStats({
        totalPlugins: pluginRequests.length,
        pendingPlugins: pluginRequests.filter(p => ['pending', 'generating', 'testing'].includes(p.status)).length,
        completedPlugins: pluginRequests.filter(p => p.status === 'completed').length,
      });
    }

    setLoading(false);
  };

  const getDaysRemaining = () => {
    if (!profile?.trial_ends_at) return 0;
    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name || 'User'}</h1>
        <p className="text-gray-600 mt-1">Manage your WordPress plugins and subscription</p>
      </div>

      {profile?.subscription_status === 'trial' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
          <Rocket className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Free Trial Active</h3>
            <p className="text-blue-700 text-sm mt-1">
              You have {getDaysRemaining()} days remaining in your trial. Upgrade to continue building plugins after your trial ends.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plugins</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPlugins}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingPlugins}</p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedPlugins}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Subscription Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium text-gray-900 capitalize">{profile?.subscription_tier}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profile?.subscription_status === 'active'
                ? 'bg-green-100 text-green-800'
                : profile?.subscription_status === 'trial'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile?.subscription_status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
              {profile?.subscription_status === 'trial' && <Clock className="w-4 h-4 mr-1" />}
              {profile?.subscription_status === 'expired' && <AlertCircle className="w-4 h-4 mr-1" />}
              {profile?.subscription_status?.charAt(0).toUpperCase() + profile?.subscription_status?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {stats.totalPlugins === 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plugins yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first WordPress plugin</p>
        </div>
      )}
    </div>
  );
}
