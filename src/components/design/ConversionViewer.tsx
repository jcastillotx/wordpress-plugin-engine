import { useState } from 'react';
import { ArrowLeft, Download, Copy, Check, Package, Code2, FileText } from 'lucide-react';

interface ConversionViewerProps {
  conversion: any;
  onBack: () => void;
}

export function ConversionViewer({ conversion, onBack }: ConversionViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'plugin'>('preview');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    let content = '';
    let filename = '';

    if (conversion.conversion_type === 'html') {
      content = conversion.result.html;
      filename = `${conversion.name.toLowerCase().replace(/\s+/g, '-')}.html`;
    } else {
      content = JSON.stringify(conversion.result, null, 2);
      filename = `${conversion.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPlugin = () => {
    if (!conversion.companion_plugin) return;

    const content = JSON.stringify(conversion.companion_plugin, null, 2);
    const filename = `companion-plugin-${conversion.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Conversions
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{conversion.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="capitalize">{conversion.conversion_type} Conversion</span>
              <span>•</span>
              <span>Created {new Date(conversion.created_at).toLocaleDateString()}</span>
              {conversion.completed_at && (
                <>
                  <span>•</span>
                  <span>Completed {new Date(conversion.completed_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadCode}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Code
            </button>
            {conversion.needs_companion_plugin && (
              <button
                onClick={downloadPlugin}
                className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
              >
                <Package className="w-4 h-4 mr-2" />
                Download Plugin
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'code'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code2 className="w-4 h-4 inline-block mr-2" />
              Code
            </button>
            {conversion.needs_companion_plugin && (
              <button
                onClick={() => setActiveTab('plugin')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'plugin'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-4 h-4 inline-block mr-2" />
                Companion Plugin
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'preview' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Design</h3>
                <img
                  src={conversion.image_url}
                  alt={conversion.name}
                  className="w-full max-w-2xl rounded-lg border border-gray-200"
                />
              </div>

              {conversion.conversion_type === 'html' && conversion.result.html && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generated Preview</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={conversion.result.html}
                      className="w-full h-96"
                      title="Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              )}

              {(conversion.conversion_type === 'divi' || conversion.conversion_type === 'elementor') && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a {conversion.conversion_type} layout. Import the code into your {conversion.conversion_type} builder to see the preview.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Code</h3>
                <button
                  onClick={() => handleCopy(
                    conversion.conversion_type === 'html'
                      ? conversion.result.html
                      : JSON.stringify(conversion.result, null, 2)
                  )}
                  className="flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>
                    {conversion.conversion_type === 'html'
                      ? conversion.result.html
                      : JSON.stringify(conversion.result, null, 2)}
                  </code>
                </pre>
              </div>

              {conversion.conversion_type === 'html' && conversion.result.css && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">CSS</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100">
                      <code>{conversion.result.css}</code>
                    </pre>
                  </div>
                </div>
              )}

              {conversion.conversion_type === 'html' && conversion.result.javascript && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">JavaScript</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100">
                      <code>{conversion.result.javascript}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'plugin' && conversion.companion_plugin && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {conversion.companion_plugin.name || 'Companion Plugin'}
                </h3>
                <p className="text-gray-600">
                  {conversion.companion_plugin.description || 'Custom plugin to support advanced design elements'}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> This companion plugin provides custom modules/widgets that aren't available in the baseline {conversion.conversion_type} library. Install this plugin alongside your layout for full functionality.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{JSON.stringify(conversion.companion_plugin, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
