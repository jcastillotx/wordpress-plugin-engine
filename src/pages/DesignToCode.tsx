import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DesignUploader } from '../components/design/DesignUploader';
import { DesignToolConnector } from '../components/design/DesignToolConnector';
import { FileBrowser } from '../components/design/FileBrowser';
import { Wand2, ArrowRight, Code2, Boxes, Upload, FileImage } from 'lucide-react';

type ImportSource = 'upload' | 'figma' | 'canva';

export function DesignToCode() {
  const { user } = useAuth();
  const [importSource, setImportSource] = useState<ImportSource>('upload');
  const [name, setName] = useState('');
  const [conversionType, setConversionType] = useState<'html' | 'divi' | 'elementor'>('html');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedDesignFile, setSelectedDesignFile] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setSelectedDesignFile(null);
  };

  const handleDesignFileSelect = (file: any) => {
    setSelectedDesignFile(file);
    setImageFile(null);
    setImagePreview('');
    setName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) return;
    if (importSource === 'upload' && !imageFile) return;
    if ((importSource === 'figma' || importSource === 'canva') && !selectedDesignFile) return;

    setSubmitting(true);

    try {
      let imageUrl = '';

      if (importSource === 'upload' && imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('design-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('design-images')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('design-images')
            .getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      } else if ((importSource === 'figma' || importSource === 'canva') && selectedDesignFile) {
        imageUrl = selectedDesignFile.thumbnail || selectedDesignFile.url;
      }

      if (imageUrl) {
        await createConversion(imageUrl);
      }
    } catch (error) {
      console.error('Error processing design:', error);
      if (imagePreview) {
        await createConversion(imagePreview);
      } else {
        alert('Failed to process design. Please try again.');
        setSubmitting(false);
      }
    }
  };

  const createConversion = async (imageUrl: string) => {
    const { data, error } = await supabase
      .from('design_conversions')
      .insert({
        user_id: user!.id,
        name,
        image_url: imageUrl,
        conversion_type: conversionType,
        prompt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversion:', error);
      alert('Failed to start conversion. Please try again.');
    } else {
      setName('');
      setPrompt('');
      setImageFile(null);
      setImagePreview('');
      setSelectedDesignFile(null);
      alert('Conversion started! Check your conversions tab to see the results.');
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Wand2 className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Design to Code</h1>
        </div>
        <p className="text-gray-600">
          Upload a design image and convert it to HTML/CSS, Divi layouts, or Elementor layouts.
          Our AI will analyze your design and generate the appropriate code or page builder configuration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversion Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Homepage Hero Section"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setConversionType('html')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    conversionType === 'html'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Code2 className={`w-8 h-8 mx-auto mb-2 ${
                    conversionType === 'html' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">HTML/CSS</p>
                  <p className="text-xs text-gray-500 mt-1">Pure code</p>
                </button>

                <button
                  type="button"
                  onClick={() => setConversionType('divi')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    conversionType === 'divi'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Boxes className={`w-8 h-8 mx-auto mb-2 ${
                    conversionType === 'divi' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">Divi</p>
                  <p className="text-xs text-gray-500 mt-1">Page layout</p>
                </button>

                <button
                  type="button"
                  onClick={() => setConversionType('elementor')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    conversionType === 'elementor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Boxes className={`w-8 h-8 mx-auto mb-2 ${
                    conversionType === 'elementor' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm font-medium text-gray-900">Elementor</p>
                  <p className="text-xs text-gray-500 mt-1">Widget layout</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Use mobile-first approach, make buttons rounded, keep it minimal..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Source</h2>

          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setImportSource('upload')}
                className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
                  importSource === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setImportSource('figma')}
                className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
                  importSource === 'figma'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                🎨 Import from Figma
              </button>
              <button
                type="button"
                onClick={() => setImportSource('canva')}
                className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
                  importSource === 'canva'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                ✨ Import from Canva
              </button>
            </div>
          </div>

          {importSource === 'upload' && (
            <DesignUploader onImageSelect={handleImageSelect} currentImage={imagePreview} />
          )}

          {importSource === 'figma' && (
            <div className="space-y-4">
              <DesignToolConnector toolName="figma" />
              <FileBrowser
                toolName="figma"
                onSelect={handleDesignFileSelect}
                selectedFileId={selectedDesignFile?.id}
              />
            </div>
          )}

          {importSource === 'canva' && (
            <div className="space-y-4">
              <DesignToolConnector toolName="canva" />
              <FileBrowser
                toolName="canva"
                onSelect={handleDesignFileSelect}
                selectedFileId={selectedDesignFile?.id}
              />
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Upload a screenshot or mockup of your design</li>
            <li>Our AI analyzes the layout, components, and styling</li>
            <li>
              {conversionType === 'html' && 'Generates clean HTML/CSS code'}
              {conversionType === 'divi' && 'Maps to Divi modules and creates a page layout'}
              {conversionType === 'elementor' && 'Maps to Elementor widgets and creates a layout'}
            </li>
            {conversionType !== 'html' && (
              <li>If custom elements are needed, a companion plugin is automatically generated</li>
            )}
          </ol>
        </div>

        <button
          type="submit"
          disabled={
            !name ||
            submitting ||
            (importSource === 'upload' && !imageFile) ||
            ((importSource === 'figma' || importSource === 'canva') && !selectedDesignFile)
          }
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Starting Conversion...
            </>
          ) : (
            <>
              Start Conversion
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
