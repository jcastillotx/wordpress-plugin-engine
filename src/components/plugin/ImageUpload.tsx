import { useState } from 'react';
import { Image, X, Plus, Link as LinkIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const addImageUrl = () => {
    if (urlInput.trim() && !images.includes(urlInput.trim())) {
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Visual Reference Images
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Image URL
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Add screenshots or mockups to show how you want your plugin output to look
      </p>

      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.png"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">No reference images added</p>
          <p className="text-xs text-gray-500">Click "Add Image URL" to add visual references</p>
        </div>
      )}
    </div>
  );
}
