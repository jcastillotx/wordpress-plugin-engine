import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileImage, RefreshCw, Search, CheckCircle } from 'lucide-react';

interface DesignFile {
  id: string;
  name: string;
  thumbnail: string;
  url: string;
  lastModified?: string;
  metadata?: any;
}

interface FileBrowserProps {
  toolName: 'figma' | 'canva';
  onSelect: (file: DesignFile) => void;
  selectedFileId?: string;
}

export function FileBrowser({ toolName, onSelect, selectedFileId }: FileBrowserProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);

  const toolConfig = {
    figma: { name: 'Figma', icon: '🎨' },
    canva: { name: 'Canva', icon: '✨' }
  };

  const config = toolConfig[toolName];

  useEffect(() => {
    loadFiles();
  }, [user, toolName]);

  const loadFiles = async () => {
    if (!user) return;

    const { data: connection } = await supabase
      .from('design_tool_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_name', toolName)
      .eq('is_active', true)
      .maybeSingle();

    if (!connection) {
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-design-files`;
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

      const { files: fetchedFiles } = await response.json();
      setFiles(fetchedFiles || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }

    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await loadFiles();
    setSyncing(false);
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
        <p className="text-gray-600 mb-4">
          No {config.name} files available. Create some designs first.
        </p>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync Files
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${config.name} files...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="ml-4 inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Sync
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <button
            key={file.id}
            onClick={() => onSelect(file)}
            className={`relative group rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
              selectedFileId === file.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-video bg-gray-100 overflow-hidden">
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileImage className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {selectedFileId === file.id && (
              <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="p-3 bg-white">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              {file.lastModified && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(file.lastModified).toLocaleDateString()}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-600">
          No files match "{searchQuery}"
        </div>
      )}
    </div>
  );
}
