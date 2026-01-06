import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Palette, Save, RotateCcw } from 'lucide-react';

interface SiteSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  site_info: {
    name: string;
    tagline: string;
    logo: string;
  };
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    theme: {
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'system-ui',
    },
    site_info: {
      name: 'WP Plugin Builder',
      tagline: 'Build custom WordPress plugins with AI',
      logo: '',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .in('key', ['theme', 'site_info']);

    if (data) {
      const themeSettings = data.find(s => s.key === 'theme');
      const siteInfo = data.find(s => s.key === 'site_info');

      setSettings({
        theme: themeSettings?.value || settings.theme,
        site_info: siteInfo?.value || settings.site_info,
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    await supabase
      .from('site_settings')
      .upsert([
        { key: 'theme', value: settings.theme },
        { key: 'site_info', value: settings.site_info },
      ], { onConflict: 'key' });

    await supabase.from('admin_logs').insert({
      action: 'Updated site settings',
      resource_type: 'settings',
    });

    setSaving(false);
  };

  const resetToDefaults = () => {
    setSettings({
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'system-ui',
      },
      site_info: {
        name: 'WP Plugin Builder',
        tagline: 'Build custom WordPress plugins with AI',
        logo: '',
      },
    });
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-1">Customize your site appearance and information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Palette className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Theme Colors</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.primaryColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, primaryColor: e.target.value }
                  })}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.primaryColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, primaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#2563eb"
                />
              </div>
              <div
                className="mt-2 h-8 rounded-md"
                style={{ backgroundColor: settings.theme.primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.secondaryColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, secondaryColor: e.target.value }
                  })}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.secondaryColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    theme: { ...settings.theme, secondaryColor: e.target.value }
                  })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#64748b"
                />
              </div>
              <div
                className="mt-2 h-8 rounded-md"
                style={{ backgroundColor: settings.theme.secondaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={settings.theme.fontFamily}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, fontFamily: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="system-ui">System UI</option>
                <option value="Inter, sans-serif">Inter</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
                <option value="'Lato', sans-serif">Lato</option>
                <option value="'Montserrat', sans-serif">Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_info.name}
                onChange={(e) => setSettings({
                  ...settings,
                  site_info: { ...settings.site_info, name: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="WP Plugin Builder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Tagline
              </label>
              <input
                type="text"
                value={settings.site_info.tagline}
                onChange={(e) => setSettings({
                  ...settings,
                  site_info: { ...settings.site_info, tagline: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Build custom WordPress plugins with AI"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={settings.site_info.logo}
                onChange={(e) => setSettings({
                  ...settings,
                  site_info: { ...settings.site_info, logo: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
              {settings.site_info.logo && (
                <div className="mt-2">
                  <img
                    src={settings.site_info.logo}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Theme changes will apply site-wide after saving. Users will see the updated colors and fonts immediately.
        </p>
      </div>
    </div>
  );
}
