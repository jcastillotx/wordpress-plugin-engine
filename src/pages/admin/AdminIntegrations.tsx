import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Key, Eye, EyeOff, Save, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  service_name: string;
  key_type: string;
  encrypted_value: string;
  is_active: boolean;
  last_used_at: string | null;
}

interface IntegrationConfig {
  name: string;
  displayName: string;
  icon: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    helpText: string;
  }[];
  docsUrl: string;
  getStartedUrl: string;
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    name: 'stripe',
    displayName: 'Stripe',
    icon: '💳',
    description: 'Accept payments and manage subscriptions',
    fields: [
      {
        key: 'publishable_key',
        label: 'Publishable Key',
        type: 'text',
        placeholder: 'pk_live_...',
        helpText: 'Your Stripe publishable key (starts with pk_)',
      },
      {
        key: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'sk_live_...',
        helpText: 'Your Stripe secret key (starts with sk_)',
      },
    ],
    docsUrl: 'https://stripe.com/docs/keys',
    getStartedUrl: 'https://dashboard.stripe.com/apikeys',
  },
  {
    name: 'openai',
    displayName: 'OpenAI',
    icon: '🤖',
    description: 'Use GPT models for AI-powered features',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        helpText: 'Your OpenAI API key',
      },
    ],
    docsUrl: 'https://platform.openai.com/docs/api-reference',
    getStartedUrl: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'anthropic',
    displayName: 'Anthropic Claude',
    icon: '🧠',
    description: 'Use Claude models for advanced AI capabilities',
    fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-ant-...',
        helpText: 'Your Anthropic API key',
      },
    ],
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    getStartedUrl: 'https://console.anthropic.com/settings/keys',
  },
];

export function AdminIntegrations() {
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, ApiKey>>>({});
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const { data } = await supabase
      .from('api_keys')
      .select('*');

    if (data) {
      const organized: Record<string, Record<string, ApiKey>> = {};
      const initialFormData: Record<string, Record<string, string>> = {};

      INTEGRATIONS.forEach(integration => {
        organized[integration.name] = {};
        initialFormData[integration.name] = {};

        integration.fields.forEach(field => {
          const existingKey = data.find(
            k => k.service_name === integration.name && k.key_type === field.key
          );
          if (existingKey) {
            organized[integration.name][field.key] = existingKey;
            initialFormData[integration.name][field.key] = existingKey.encrypted_value;
          } else {
            initialFormData[integration.name][field.key] = '';
          }
        });
      });

      setApiKeys(organized);
      setFormData(initialFormData);
    }

    setLoading(false);
  };

  const handleSave = async (integrationName: string) => {
    setSaving(integrationName);
    setSaveStatus({ ...saveStatus, [integrationName]: null });

    try {
      const integration = INTEGRATIONS.find(i => i.name === integrationName);
      if (!integration) return;

      for (const field of integration.fields) {
        const value = formData[integrationName]?.[field.key];
        if (!value) continue;

        const existingKey = apiKeys[integrationName]?.[field.key];

        if (existingKey) {
          await supabase
            .from('api_keys')
            .update({
              encrypted_value: value,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingKey.id);
        } else {
          await supabase
            .from('api_keys')
            .insert({
              service_name: integrationName,
              key_type: field.key,
              encrypted_value: value,
              is_active: true,
            });
        }
      }

      await supabase.from('admin_logs').insert({
        action: `Updated ${integration.displayName} API keys`,
        resource_type: 'integration',
      });

      setSaveStatus({ ...saveStatus, [integrationName]: 'success' });
      setTimeout(() => {
        setSaveStatus({ ...saveStatus, [integrationName]: null });
      }, 3000);

      await loadApiKeys();
    } catch (error) {
      console.error('Failed to save API keys:', error);
      setSaveStatus({ ...saveStatus, [integrationName]: 'error' });
    } finally {
      setSaving(null);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys({ ...showKeys, [key]: !showKeys[key] });
  };

  const updateFormData = (integration: string, field: string, value: string) => {
    setFormData({
      ...formData,
      [integration]: {
        ...formData[integration],
        [field]: value,
      },
    });
  };

  const isIntegrationConfigured = (integrationName: string): boolean => {
    const integration = INTEGRATIONS.find(i => i.name === integrationName);
    if (!integration) return false;

    return integration.fields.every(field => {
      const value = formData[integrationName]?.[field.key];
      return value && value.length > 0;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">Connect third-party services to unlock features</p>
      </div>

      <div className="space-y-6">
        {INTEGRATIONS.map(integration => {
          const isConfigured = isIntegrationConfigured(integration.name);
          const isSaving = saving === integration.name;
          const status = saveStatus[integration.name];

          return (
            <div key={integration.name} className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{integration.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {integration.displayName}
                        </h2>
                        {isConfigured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={integration.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Docs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  {integration.fields.map(field => {
                    const fieldKey = `${integration.name}_${field.key}`;
                    const showPassword = showKeys[fieldKey];
                    const value = formData[integration.name]?.[field.key] || '';

                    return (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showPassword ? 'password' : 'text'}
                            value={value}
                            onChange={(e) => updateFormData(integration.name, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => toggleShowKey(fieldKey)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
                      </div>
                    );
                  })}

                  {!isConfigured && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-900 font-medium mb-1">Get your API keys</p>
                          <p className="text-blue-800 mb-2">
                            Visit your {integration.displayName} dashboard to create and copy your API keys.
                          </p>
                          <a
                            href={integration.getStartedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Go to {integration.displayName} Dashboard
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      {status === 'success' && (
                        <span className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Saved successfully
                        </span>
                      )}
                      {status === 'error' && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Failed to save
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleSave(integration.name)}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Security Notice</p>
            <p>
              API keys are sensitive credentials. Store them securely and never share them publicly.
              In production, implement proper encryption for API keys at rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
