import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, X, Plus, Trash2, MoveUp, MoveDown, Type, Image as ImageIcon, Layout, Code } from 'lucide-react';

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'cta' | 'html' | 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'video' | 'divider' | 'columns';
  content: any;
}

interface PageBuilderProps {
  page: any | null;
  onSave: () => void;
  onCancel: () => void;
}

const TEMPLATES = [
  { value: 'default', label: 'Default' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'docs', label: 'Documentation' },
  { value: 'full-width', label: 'Full Width' },
];

const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'paragraph', label: 'Paragraph', icon: Type },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'hero', label: 'Hero Section', icon: Layout },
  { type: 'features', label: 'Features Grid', icon: Layout },
  { type: 'testimonials', label: 'Testimonials', icon: Layout },
  { type: 'pricing', label: 'Pricing Table', icon: Layout },
  { type: 'faq', label: 'FAQ', icon: Layout },
  { type: 'cta', label: 'Call to Action', icon: Layout },
  { type: 'video', label: 'Video', icon: ImageIcon },
  { type: 'columns', label: 'Columns', icon: Layout },
  { type: 'divider', label: 'Divider', icon: Layout },
  { type: 'html', label: 'HTML', icon: Code },
];

export function PageBuilder({ page, onSave, onCancel }: PageBuilderProps) {
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [template, setTemplate] = useState(page?.template || 'default');
  const [metaTitle, setMetaTitle] = useState(page?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(page?.meta_description || '');
  const [blocks, setBlocks] = useState<Block[]>(page?.content || []);
  const [saving, setSaving] = useState(false);

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: type as any,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'heading':
        return { text: 'New Heading', level: 2 };
      case 'paragraph':
        return { text: 'Enter your text here...' };
      case 'image':
        return { url: '', alt: '', caption: '' };
      case 'hero':
        return { title: 'Welcome to Our Site', subtitle: 'Build amazing things together', buttonText: 'Get Started', buttonUrl: '#', backgroundImage: '' };
      case 'features':
        return {
          items: [
            { title: 'Feature 1', description: 'Description here', icon: '✓' },
            { title: 'Feature 2', description: 'Description here', icon: '✓' },
            { title: 'Feature 3', description: 'Description here', icon: '✓' }
          ]
        };
      case 'testimonials':
        return {
          items: [
            { quote: 'Great product!', author: 'John Doe', role: 'CEO', avatar: '' },
            { quote: 'Highly recommend!', author: 'Jane Smith', role: 'Designer', avatar: '' }
          ]
        };
      case 'pricing':
        return {
          plans: [
            { name: 'Basic', price: '9', features: ['Feature 1', 'Feature 2'], buttonText: 'Subscribe', buttonUrl: '#' },
            { name: 'Pro', price: '29', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Subscribe', buttonUrl: '#', highlighted: true }
          ]
        };
      case 'faq':
        return {
          items: [
            { question: 'Question 1?', answer: 'Answer here' },
            { question: 'Question 2?', answer: 'Answer here' }
          ]
        };
      case 'video':
        return { url: '', caption: '' };
      case 'columns':
        return {
          count: 2,
          columns: [
            { content: 'Column 1 content' },
            { content: 'Column 2 content' }
          ]
        };
      case 'divider':
        return { style: 'solid', width: '100%' };
      case 'cta':
        return { title: 'Call to Action', description: '', buttonText: 'Get Started', buttonUrl: '#' };
      case 'html':
        return { html: '<div>Custom HTML</div>' };
      default:
        return {};
    }
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => block.id === id ? { ...block, content } : block));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    setSaving(true);

    const pageData = {
      title,
      slug,
      template,
      meta_title: metaTitle,
      meta_description: metaDescription,
      content: blocks,
    };

    if (page?.id) {
      await supabase.from('pages').update(pageData).eq('id', page.id);
      await supabase.from('admin_logs').insert({
        action: `Updated page: ${title}`,
        resource_type: 'page',
        resource_id: page.id,
      });
    } else {
      await supabase.from('pages').insert(pageData);
      await supabase.from('admin_logs').insert({
        action: `Created page: ${title}`,
        resource_type: 'page',
      });
    }

    setSaving(false);
    onSave();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {page ? 'Edit Page' : 'Create New Page'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title || !slug}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="About Us"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="about-us"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TEMPLATES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Content Blocks</h3>
              <div className="flex gap-1">
                {BLOCK_TYPES.map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title={`Add ${type}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <BlockEditor
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={blocks.length}
                  onUpdate={(content) => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
                  onMove={(direction) => moveBlock(index, direction)}
                />
              ))}

              {blocks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No content blocks yet</p>
                  <p className="text-sm">Click the icons above to add content</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={title}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page description..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockEditor({ block, index, totalBlocks, onUpdate, onDelete, onMove }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 capitalize">{block.type}</span>
        <div className="flex items-center gap-1">
          {index > 0 && (
            <button onClick={() => onMove('up')} className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <MoveUp className="w-4 h-4" />
            </button>
          )}
          {index < totalBlocks - 1 && (
            <button onClick={() => onMove('down')} className="p-1 text-gray-600 hover:bg-gray-100 rounded">
              <MoveDown className="w-4 h-4" />
            </button>
          )}
          <button onClick={onDelete} className="p-1 text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {block.type === 'heading' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content.text}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Heading text"
          />
          <select
            value={block.content.level}
            onChange={(e) => onUpdate({ ...block.content, level: parseInt(e.target.value) })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
        </div>
      )}

      {block.type === 'paragraph' && (
        <textarea
          value={block.content.text}
          onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Paragraph text"
        />
      )}

      {block.type === 'image' && (
        <div className="space-y-2">
          <input
            type="url"
            value={block.content.url}
            onChange={(e) => onUpdate({ ...block.content, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Image URL"
          />
          <input
            type="text"
            value={block.content.alt}
            onChange={(e) => onUpdate({ ...block.content, alt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Alt text"
          />
        </div>
      )}

      {block.type === 'cta' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content.title}
            onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="CTA Title"
          />
          <textarea
            value={block.content.description}
            onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Description"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={block.content.buttonText}
              onChange={(e) => onUpdate({ ...block.content, buttonText: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Button Text"
            />
            <input
              type="url"
              value={block.content.buttonUrl}
              onChange={(e) => onUpdate({ ...block.content, buttonUrl: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Button URL"
            />
          </div>
        </div>
      )}

      {block.type === 'hero' && (
        <div className="space-y-2">
          <input
            type="text"
            value={block.content.title}
            onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Hero Title"
          />
          <input
            type="text"
            value={block.content.subtitle}
            onChange={(e) => onUpdate({ ...block.content, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Subtitle"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={block.content.buttonText}
              onChange={(e) => onUpdate({ ...block.content, buttonText: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Button Text"
            />
            <input
              type="url"
              value={block.content.buttonUrl}
              onChange={(e) => onUpdate({ ...block.content, buttonUrl: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Button URL"
            />
          </div>
          <input
            type="url"
            value={block.content.backgroundImage}
            onChange={(e) => onUpdate({ ...block.content, backgroundImage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Background Image URL (optional)"
          />
        </div>
      )}

      {block.type === 'features' && (
        <div className="space-y-3">
          {block.content.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.icon}
                  onChange={(e) => {
                    const newItems = [...block.content.items];
                    newItems[idx] = { ...item, icon: e.target.value };
                    onUpdate({ items: newItems });
                  }}
                  className="w-16 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Icon"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...block.content.items];
                    newItems[idx] = { ...item, title: e.target.value };
                    onUpdate({ items: newItems });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Feature Title"
                />
              </div>
              <textarea
                value={item.description}
                onChange={(e) => {
                  const newItems = [...block.content.items];
                  newItems[idx] = { ...item, description: e.target.value };
                  onUpdate({ items: newItems });
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Description"
              />
            </div>
          ))}
          <button
            onClick={() => onUpdate({ items: [...block.content.items, { title: 'New Feature', description: '', icon: '✓' }] })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Feature
          </button>
        </div>
      )}

      {block.type === 'testimonials' && (
        <div className="space-y-3">
          {block.content.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
              <textarea
                value={item.quote}
                onChange={(e) => {
                  const newItems = [...block.content.items];
                  newItems[idx] = { ...item, quote: e.target.value };
                  onUpdate({ items: newItems });
                }}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Testimonial Quote"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.author}
                  onChange={(e) => {
                    const newItems = [...block.content.items];
                    newItems[idx] = { ...item, author: e.target.value };
                    onUpdate({ items: newItems });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Author Name"
                />
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => {
                    const newItems = [...block.content.items];
                    newItems[idx] = { ...item, role: e.target.value };
                    onUpdate({ items: newItems });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Role/Title"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => onUpdate({ items: [...block.content.items, { quote: '', author: '', role: '', avatar: '' }] })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add Testimonial
          </button>
        </div>
      )}

      {block.type === 'video' && (
        <div className="space-y-2">
          <input
            type="url"
            value={block.content.url}
            onChange={(e) => onUpdate({ ...block.content, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Video URL (YouTube, Vimeo, etc.)"
          />
          <input
            type="text"
            value={block.content.caption}
            onChange={(e) => onUpdate({ ...block.content, caption: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Caption (optional)"
          />
        </div>
      )}

      {block.type === 'faq' && (
        <div className="space-y-3">
          {block.content.items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
              <input
                type="text"
                value={item.question}
                onChange={(e) => {
                  const newItems = [...block.content.items];
                  newItems[idx] = { ...item, question: e.target.value };
                  onUpdate({ items: newItems });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-medium"
                placeholder="Question"
              />
              <textarea
                value={item.answer}
                onChange={(e) => {
                  const newItems = [...block.content.items];
                  newItems[idx] = { ...item, answer: e.target.value };
                  onUpdate({ items: newItems });
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Answer"
              />
            </div>
          ))}
          <button
            onClick={() => onUpdate({ items: [...block.content.items, { question: '', answer: '' }] })}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add FAQ Item
          </button>
        </div>
      )}

      {block.type === 'columns' && (
        <div className="space-y-2">
          <select
            value={block.content.count}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              const columns = Array(count).fill(null).map((_, i) =>
                block.content.columns[i] || { content: `Column ${i + 1} content` }
              );
              onUpdate({ count, columns });
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
          <div className="space-y-2">
            {block.content.columns.map((col: any, idx: number) => (
              <textarea
                key={idx}
                value={col.content}
                onChange={(e) => {
                  const newColumns = [...block.content.columns];
                  newColumns[idx] = { content: e.target.value };
                  onUpdate({ ...block.content, columns: newColumns });
                }}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Column ${idx + 1} content`}
              />
            ))}
          </div>
        </div>
      )}

      {block.type === 'divider' && (
        <div className="space-y-2">
          <select
            value={block.content.style}
            onChange={(e) => onUpdate({ ...block.content, style: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="solid">Solid Line</option>
            <option value="dashed">Dashed Line</option>
            <option value="dotted">Dotted Line</option>
          </select>
        </div>
      )}

      {block.type === 'html' && (
        <textarea
          value={block.content.html}
          onChange={(e) => onUpdate({ ...block.content, html: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
          placeholder="<div>Custom HTML</div>"
        />
      )}
    </div>
  );
}
