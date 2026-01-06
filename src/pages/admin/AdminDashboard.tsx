import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, CreditCard, FileText, TrendingUp } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalPlugins: number;
  activeSubscriptions: number;
  totalPages: number;
  recentActivity: any[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPlugins: 0,
    activeSubscriptions: 0,
    totalPages: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [users, plugins, subscriptions, pages, logs] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('plugin_requests').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('pages').select('id', { count: 'exact', head: true }),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(10),
    ]);

    setStats({
      totalUsers: users.count || 0,
      totalPlugins: plugins.count || 0,
      activeSubscriptions: subscriptions.count || 0,
      totalPages: pages.count || 0,
      recentActivity: logs.data || [],
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plugins</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPlugins}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-amber-100 rounded-full p-3">
              <CreditCard className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Pages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPages}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
        </div>
        <div className="p-6">
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((log) => (
                <div key={log.id} className="flex items-start py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    {log.resource_type && (
                      <p className="text-xs text-gray-500 mt-1">
                        {log.resource_type} {log.resource_id && `(${log.resource_id.substring(0, 8)}...)`}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
