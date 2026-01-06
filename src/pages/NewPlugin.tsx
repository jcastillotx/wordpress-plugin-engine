import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Sparkles } from 'lucide-react';
import { ImageUpload } from '../components/plugin/ImageUpload';
import { BuilderModuleOptions } from '../components/plugin/BuilderModuleOptions';

const PLUGIN_TYPES = [
  { value: 'woocommerce', label: 'WooCommerce Integration' },
  { value: 'seo', label: 'SEO Enhancement' },
  { value: 'membership', label: 'Membership System' },
  { value: 'forms', label: 'Custom Forms' },
  { value: 'security', label: 'Security Enhancement' },
  { value: 'performance', label: 'Performance Optimization' },
  { value: 'social', label: 'Social Media Integration' },
  { value: 'custom', label: 'Custom Plugin' },
];

const COMMON_FEATURES = [
  'Shortcode Generator',
  'Custom Post Types',
  'REST API Integration',
  'Admin Dashboard',
  'Email Notifications',
  'User Roles & Permissions',
  'Database Tables',
  'AJAX Functionality',
  'Widget Support',
  'Gutenberg Blocks',
  'Webhook Integration',
  'CSV Import/Export',
];

const THEME_COMPATIBILITY = [
  'Divi',
  'Elementor',
  'Astra',
  'OceanWP',
  'GeneratePress',
  'Avada',
  'Enfold',
  'Salient',
];

interface NewPluginProps {
  onSuccess: () => void;
}

export function NewPlugin({ onSuccess }: NewPluginProps) {
  const { user } = useAuth();
  const [pluginName, setPluginName] = useState('');
  const [pluginType, setPluginType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [builderType, setBuilderType] = useState<string | null>(null);
  const [builderConfig, setBuilderConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const addCustomFeature = () => {
    if (customFeature.trim() && !selectedFeatures.includes(customFeature.trim())) {
      setSelectedFeatures(prev => [...prev, customFeature.trim()]);
      setCustomFeature('');
    }
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('plugin_requests').insert({
        user_id: user.id,
        plugin_name: pluginName,
        plugin_type: pluginType,
        description,
        custom_features: selectedFeatures,
        theme_compatibility: selectedThemes,
        reference_images: referenceImages,
        builder_type: builderType,
        builder_config: builderConfig,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setPluginName('');
      setPluginType('');
      setDescription('');
      setSelectedFeatures([]);
      setSelectedThemes([]);
      setReferenceImages([]);
      setBuilderType(null);
      setBuilderConfig({});

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plugin request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Plugin</h1>
        <p className="text-gray-600 mt-1">Fill in the details below to generate your custom WordPress plugin</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200">
        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="pluginName" className="block text-sm font-medium text-gray-700 mb-2">
              Plugin Name <span className="text-red-500">*</span>
            </label>
            <input
              id="pluginName"
              type="text"
              value={pluginName}
              onChange={(e) => setPluginName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Awesome Plugin"
            />
          </div>

          <div>
            <label htmlFor="pluginType" className="block text-sm font-medium text-gray-700 mb-2">
              Plugin Type <span className="text-red-500">*</span>
            </label>
            <select
              id="pluginType"
              value={pluginType}
              onChange={(e) => setPluginType(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a type...</option>
              {PLUGIN_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what your plugin should do..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {COMMON_FEATURES.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFeatures.includes(feature)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Add custom feature..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
              />
              <button
                type="button"
                onClick={addCustomFeature}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {selectedFeatures.filter(f => !COMMON_FEATURES.includes(f)).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedFeatures.filter(f => !COMMON_FEATURES.includes(f)).map(feature => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme Compatibility
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEME_COMPATIBILITY.map(theme => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => toggleTheme(theme)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedThemes.includes(theme)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <BuilderModuleOptions
            builderType={builderType}
            onChange={setBuilderType}
            builderConfig={builderConfig}
            onConfigChange={setBuilderConfig}
          />

          <ImageUpload
            images={referenceImages}
            onChange={setReferenceImages}
          />
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {loading ? 'Creating...' : 'Generate Plugin'}
          </button>
        </div>
      </form>
    </div>
  );
}
