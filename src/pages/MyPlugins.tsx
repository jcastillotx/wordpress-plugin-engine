import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Package, Download, Clock, CheckCircle, AlertCircle, Loader, ExternalLink, Image as ImageIcon, Boxes } from 'lucide-react';

interface PluginRequest {
  id: string;
  plugin_name: string;
  plugin_type: string;
  description: string;
  status: string;
  created_at: string;
  custom_features: string[];
  theme_compatibility: string[];
  reference_images: string[];
  builder_type: string | null;
  builder_config: any;
}

interface GeneratedPlugin {
  id: string;
  request_id: string;
  plugin_file_url: string;
  version: string;
  test_site_url: string | null;
  download_count: number;
}

export function MyPlugins() {
  const { user } = useAuth();
  const [plugins, setPlugins] = useState<PluginRequest[]>([]);
  const [generatedPlugins, setGeneratedPlugins] = useState<Record<string, GeneratedPlugin>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlugins();
  }, [user]);

  const loadPlugins = async () => {
    if (!user) return;

    const { data: pluginRequests } = await supabase
      .from('plugin_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (pluginRequests) {
      setPlugins(pluginRequests);

      const requestIds = pluginRequests.map(p => p.id);
      const { data: generated } = await supabase
        .from('generated_plugins')
        .select('*')
        .in('request_id', requestIds);

      if (generated) {
        const generatedMap: Record<string, GeneratedPlugin> = {};
        generated.forEach(g => {
          generatedMap[g.request_id] = g;
        });
        setGeneratedPlugins(generatedMap);
      }
    }

    setLoading(false);
  };

  const handleDownload = async (pluginId: string) => {
    const plugin = generatedPlugins[pluginId];
    if (!plugin) return;

    await supabase
      .from('generated_plugins')
      .update({ download_count: plugin.download_count + 1 })
      .eq('id', plugin.id);

    window.open(plugin.plugin_file_url, '_blank');

    setGeneratedPlugins(prev => ({
      ...prev,
      [pluginId]: {
        ...plugin,
        download_count: plugin.download_count + 1,
      },
    }));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-100',
          label: 'Pending',
        };
      case 'generating':
        return {
          icon: Loader,
          color: 'text-blue-600 bg-blue-100',
          label: 'Generating',
        };
      case 'testing':
        return {
          icon: Loader,
          color: 'text-amber-600 bg-amber-100',
          label: 'Testing',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          label: 'Completed',
        };
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-600 bg-red-100',
          label: 'Failed',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-100',
          label: status,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (plugins.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">No plugins yet</h2>
        <p className="text-gray-600 mb-6">Create your first plugin to get started</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Plugins</h1>
        <p className="text-gray-600 mt-1">View and download your generated WordPress plugins</p>
      </div>

      <div className="space-y-4">
        {plugins.map((plugin) => {
          const statusInfo = getStatusInfo(plugin.status);
          const StatusIcon = statusInfo.icon;
          const generated = generatedPlugins[plugin.id];

          return (
            <div key={plugin.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{plugin.plugin_name}</h3>
                    <p className="text-sm text-gray-500">
                      Created {new Date(plugin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                    <StatusIcon className={`w-4 h-4 mr-1 ${plugin.status === 'generating' || plugin.status === 'testing' ? 'animate-spin' : ''}`} />
                    {statusInfo.label}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{plugin.description}</p>

                {plugin.builder_type && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      plugin.builder_type === 'divi' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <Boxes className="w-4 h-4 mr-1" />
                      {plugin.builder_type === 'divi' ? 'Divi Module' : 'Elementor Widget'}
                      {plugin.builder_config?.moduleType && ` - ${plugin.builder_config.moduleType}`}
                    </span>
                  </div>
                )}

                {plugin.reference_images && plugin.reference_images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Reference Images
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {plugin.reference_images.map((imageUrl, index) => (
                        <a
                          key={index}
                          href={imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                        >
                          <img
                            src={imageUrl}
                            alt={`Reference ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Type:</span>{' '}
                    <span className="capitalize">{plugin.plugin_type.replace('-', ' ')}</span>
                  </div>
                  {plugin.custom_features && plugin.custom_features.length > 0 && (
                    <div>
                      <span className="font-medium">Features:</span>{' '}
                      {plugin.custom_features.length}
                    </div>
                  )}
                  {plugin.theme_compatibility && plugin.theme_compatibility.length > 0 && (
                    <div>
                      <span className="font-medium">Compatible with:</span>{' '}
                      {plugin.theme_compatibility.join(', ')}
                    </div>
                  )}
                </div>

                {generated && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Version {generated.version} • Downloaded {generated.download_count} times
                        </p>
                        {generated.test_site_url && (
                          <a
                            href={generated.test_site_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Test Site
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(plugin.id)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                )}

                {plugin.status === 'pending' && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      Your plugin request is being processed. This typically takes a few minutes.
                    </p>
                  </div>
                )}

                {plugin.status === 'failed' && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm text-red-600">
                      There was an error generating your plugin. Please try creating a new request.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
