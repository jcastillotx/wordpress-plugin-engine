import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, Loader, Eye, Download, Code2, Boxes, Package } from 'lucide-react';
import { ConversionViewer } from '../components/design/ConversionViewer';

interface Conversion {
  id: string;
  name: string;
  image_url: string;
  conversion_type: 'html' | 'divi' | 'elementor';
  status: 'pending' | 'analyzing' | 'generating' | 'completed' | 'failed';
  needs_companion_plugin: boolean;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function MyConversions() {
  const { user } = useAuth();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);

  useEffect(() => {
    loadConversions();
  }, [user]);

  const loadConversions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('design_conversions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setConversions(data);
    }

    setLoading(false);
  };

  const processConversion = async (conversionId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      return;
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-design-conversion`;
    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ conversionId })
      });

      loadConversions();
    } catch (error) {
      console.error('Error processing conversion:', error);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', label: 'Pending' };
      case 'analyzing':
        return { icon: Loader, color: 'text-blue-600 bg-blue-100', label: 'Analyzing' };
      case 'generating':
        return { icon: Loader, color: 'text-blue-600 bg-blue-100', label: 'Generating' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Completed' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Failed' };
      default:
        return { icon: Clock, color: 'text-gray-600 bg-gray-100', label: status };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
        return <Code2 className="w-4 h-4" />;
      case 'divi':
      case 'elementor':
        return <Boxes className="w-4 h-4" />;
      default:
        return <Code2 className="w-4 h-4" />;
    }
  };

  if (selectedConversion) {
    return <ConversionViewer conversion={selectedConversion} onBack={() => setSelectedConversion(null)} />;
  }

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
        <h1 className="text-3xl font-bold text-gray-900">My Conversions</h1>
        <p className="text-gray-600 mt-1">View and manage your design-to-code conversions</p>
      </div>

      {conversions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conversions.map((conversion) => {
            const statusInfo = getStatusInfo(conversion.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={conversion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={conversion.image_url}
                    alt={conversion.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className={`w-3 h-3 mr-1 ${(conversion.status === 'analyzing' || conversion.status === 'generating') ? 'animate-spin' : ''}`} />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{conversion.name}</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {getTypeIcon(conversion.conversion_type)}
                      <span className="ml-1">{conversion.conversion_type}</span>
                    </span>
                  </div>

                  {conversion.needs_companion_plugin && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        <Package className="w-3 h-3 mr-1" />
                        Companion Plugin
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mb-3">
                    Created {new Date(conversion.created_at).toLocaleDateString()}
                  </p>

                  {conversion.status === 'pending' && (
                    <button
                      onClick={() => processConversion(conversion.id)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      Start Processing
                    </button>
                  )}

                  {conversion.status === 'completed' && (
                    <button
                      onClick={() => setSelectedConversion(conversion)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Results
                    </button>
                  )}

                  {conversion.status === 'failed' && (
                    <div className="text-sm text-red-600">
                      {conversion.error_message || 'Conversion failed'}
                    </div>
                  )}

                  {(conversion.status === 'analyzing' || conversion.status === 'generating') && (
                    <div className="text-sm text-gray-600 text-center">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversions yet</h3>
          <p className="text-gray-600">Start by converting your first design to code</p>
        </div>
      )}
    </div>
  );
}
