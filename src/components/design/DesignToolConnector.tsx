import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';

interface Connection {
  id: string;
  tool_name: 'figma' | 'canva';
  account_email: string | null;
  account_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface DesignToolConnectorProps {
  toolName: 'figma' | 'canva';
  onConnected?: () => void;
}

export function DesignToolConnector({ toolName, onConnected }: DesignToolConnectorProps) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const toolConfig = {
    figma: {
      name: 'Figma',
      color: 'purple',
      icon: '🎨',
      description: 'Connect your Figma account to import designs'
    },
    canva: {
      name: 'Canva',
      color: 'blue',
      icon: '✨',
      description: 'Connect your Canva account to import designs'
    }
  };

  const config = toolConfig[toolName];

  useEffect(() => {
    loadConnection();
  }, [user, toolName]);

  const loadConnection = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('design_tool_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_name', toolName)
      .maybeSingle();

    setConnection(data);
    setLoading(false);
  };

  const handleConnect = async () => {
    setConnecting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session');
      setConnecting(false);
      return;
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connect-design-tool`;
    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ toolName })
      });

      const { authUrl } = await response.json();

      if (authUrl) {
        window.open(authUrl, '_blank', 'width=600,height=700');

        const checkConnection = setInterval(async () => {
          await loadConnection();
          const { data } = await supabase
            .from('design_tool_connections')
            .select('*')
            .eq('user_id', user!.id)
            .eq('tool_name', toolName)
            .maybeSingle();

          if (data) {
            clearInterval(checkConnection);
            setConnection(data);
            setConnecting(false);
            onConnected?.();
          }
        }, 2000);

        setTimeout(() => {
          clearInterval(checkConnection);
          setConnecting(false);
        }, 60000);
      }
    } catch (error) {
      console.error('Error connecting:', error);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    const confirmed = confirm(`Disconnect from ${config.name}?`);
    if (!confirmed) return;

    await supabase
      .from('design_tool_connections')
      .delete()
      .eq('id', connection.id);

    setConnection(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${connection ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{config.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connection ? (
            <>
              <div className="flex items-center text-green-600 mr-2">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Disconnect"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className={`flex items-center px-4 py-2 bg-${config.color}-600 hover:bg-${config.color}-700 disabled:bg-${config.color}-400 text-white font-medium rounded-md transition-colors`}
            >
              {connecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Connect ${config.name}`
              )}
            </button>
          )}
        </div>
      </div>

      {connection && connection.account_email && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Account:</span> {connection.account_email}
          </p>
          {connection.account_name && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Name:</span> {connection.account_name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
