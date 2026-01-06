import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { PageBuilder } from '../../components/admin/PageBuilder';

interface Page {
  id: string;
  slug: string;
  title: string;
  template: string;
  published: boolean;
  created_at: string;
}

export function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPages(data);
    }

    setLoading(false);
  };

  const handleNewPage = () => {
    setSelectedPage(null);
    setShowBuilder(true);
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setShowBuilder(true);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    await supabase.from('pages').delete().eq('id', pageId);

    await supabase.from('admin_logs').insert({
      action: 'Deleted page',
      resource_type: 'page',
      resource_id: pageId,
    });

    loadPages();
  };

  const togglePublished = async (page: Page) => {
    await supabase
      .from('pages')
      .update({ published: !page.published })
      .eq('id', page.id);

    await supabase.from('admin_logs').insert({
      action: `${!page.published ? 'Published' : 'Unpublished'} page: ${page.title}`,
      resource_type: 'page',
      resource_id: page.id,
    });

    loadPages();
  };

  const handleSave = () => {
    setShowBuilder(false);
    loadPages();
  };

  if (showBuilder) {
    return <PageBuilder page={selectedPage} onSave={handleSave} onCancel={() => setShowBuilder(false)} />;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Page Management</h1>
          <p className="text-gray-600 mt-1">Create and manage custom pages</p>
        </div>
        <button
          onClick={handleNewPage}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        {pages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{page.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">/{page.slug}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                        {page.template}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublished(page)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          page.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {page.published ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditPage(page)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pages yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom page</p>
            <button
              onClick={handleNewPage}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
