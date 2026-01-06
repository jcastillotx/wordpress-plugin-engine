import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Clock, CheckCircle, AlertCircle, Loader, Boxes } from 'lucide-react';

interface Plugin {
  id: string;
  plugin_name: string;
  plugin_type: string;
  status: string;
  builder_type: string | null;
  created_at: string;
  user_id: string;
  profile: {
    full_name: string;
  };
}

export function AdminPlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [searchQuery, filterStatus, filterType, plugins]);

  const loadPlugins = async () => {
    const { data } = await supabase
      .from('plugin_requests')
      .select(`
        *,
        profile:profiles(full_name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setPlugins(data as any);
    }

    setLoading(false);
  };

  const filterPlugins = () => {
    let filtered = plugins;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(plugin => plugin.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(plugin => plugin.builder_type === filterType || (filterType === 'standard' && !plugin.builder_type));
    }

    if (searchQuery) {
      filtered = filtered.filter(plugin =>
        plugin.plugin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.profile?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlugins(filtered);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', label: 'Pending' };
      case 'generating':
        return { icon: Loader, color: 'text-blue-600 bg-blue-100', label: 'Generating' };
      case 'testing':
        return { icon: Loader, color: 'text-amber-600 bg-amber-100', label: 'Testing' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-600 bg-red-100', label: 'Failed' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', label: status };
    }
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
        <h1 className="text-3xl font-bold text-gray-900">All Plugins</h1>
        <p className="text-gray-600 mt-1">View all plugin requests across the platform</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by plugin name or user..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="generating">Generating</option>
              <option value="testing">Testing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard Plugin</option>
              <option value="divi">Divi Module</option>
              <option value="elementor">Elementor Widget</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plugin Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlugins.length > 0 ? (
                filteredPlugins.map((plugin) => {
                  const statusInfo = getStatusInfo(plugin.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={plugin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{plugin.plugin_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{plugin.plugin_type.replace('-', ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{plugin.profile?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{plugin.user_id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plugin.builder_type ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            plugin.builder_type === 'divi' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <Boxes className="w-3 h-3 mr-1" />
                            {plugin.builder_type === 'divi' ? 'Divi' : 'Elementor'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Standard</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${plugin.status === 'generating' || plugin.status === 'testing' ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plugin.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No plugins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
