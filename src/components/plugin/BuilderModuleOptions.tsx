import { Boxes } from 'lucide-react';

interface BuilderModuleOptionsProps {
  builderType: string | null;
  onChange: (builderType: string | null) => void;
  builderConfig: any;
  onConfigChange: (config: any) => void;
}

const DIVI_OPTIONS = [
  { id: 'basic', label: 'Basic Module', description: 'Simple module with text and styling options' },
  { id: 'advanced', label: 'Advanced Module', description: 'Complex module with custom fields and controls' },
  { id: 'slider', label: 'Slider Module', description: 'Carousel/slider with multiple items' },
  { id: 'form', label: 'Form Module', description: 'Custom form with validation' },
];

const ELEMENTOR_OPTIONS = [
  { id: 'basic', label: 'Basic Widget', description: 'Simple widget with controls' },
  { id: 'advanced', label: 'Advanced Widget', description: 'Complex widget with multiple sections' },
  { id: 'dynamic', label: 'Dynamic Widget', description: 'Widget with dynamic content' },
  { id: 'form', label: 'Form Widget', description: 'Custom form widget' },
];

export function BuilderModuleOptions({ builderType, onChange, builderConfig, onConfigChange }: BuilderModuleOptionsProps) {
  const handleModuleTypeChange = (type: string) => {
    onConfigChange({ ...builderConfig, moduleType: type });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Page Builder Module Type
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Create custom modules/widgets for popular page builders
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              builderType === null
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-gray-900 mb-1">Standard Plugin</div>
            <div className="text-sm text-gray-600">Regular WordPress plugin</div>
          </button>

          <button
            type="button"
            onClick={() => onChange('divi')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              builderType === 'divi'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-1">
              <Boxes className="w-4 h-4 mr-2 text-blue-600" />
              <div className="font-semibold text-gray-900">Divi Module</div>
            </div>
            <div className="text-sm text-gray-600">Custom Divi Builder module</div>
          </button>

          <button
            type="button"
            onClick={() => onChange('elementor')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              builderType === 'elementor'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-1">
              <Boxes className="w-4 h-4 mr-2 text-red-600" />
              <div className="font-semibold text-gray-900">Elementor Widget</div>
            </div>
            <div className="text-sm text-gray-600">Custom Elementor widget</div>
          </button>
        </div>
      </div>

      {builderType === 'divi' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Divi Module Configuration</h4>
          <div className="space-y-2">
            {DIVI_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-start p-3 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="diviModuleType"
                  value={option.id}
                  checked={builderConfig?.moduleType === option.id}
                  onChange={() => handleModuleTypeChange(option.id)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <strong>Note:</strong> Your Divi module will include the Visual Builder interface, custom settings panel, and responsive controls.
          </div>
        </div>
      )}

      {builderType === 'elementor' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Elementor Widget Configuration</h4>
          <div className="space-y-2">
            {ELEMENTOR_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex items-start p-3 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="elementorWidgetType"
                  value={option.id}
                  checked={builderConfig?.moduleType === option.id}
                  onChange={() => handleModuleTypeChange(option.id)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <strong>Note:</strong> Your Elementor widget will include controls, styling options, and responsive settings following Elementor best practices.
          </div>
        </div>
      )}
    </div>
  );
}
