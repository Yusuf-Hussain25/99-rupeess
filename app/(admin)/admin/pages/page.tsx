'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Page {
  _id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesPage() {
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    isPublished: true,
  });
  const [filterPublished, setFilterPublished] = useState<string>('all');
  const [previewPage, setPreviewPage] = useState<Page | null>(null);

  useEffect(() => {
    if (token) {
      fetchPages();
    }
  }, [token, filterPublished]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const query = filterPublished !== 'all' ? `?isPublished=${filterPublished === 'published'}` : '';
      const res = await fetch(`/api/admin/pages${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPage ? formData.slug : generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPage
        ? `/api/admin/pages/${editingPage._id}`
        : '/api/admin/pages';
      const method = editingPage ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingPage ? 'Page updated successfully' : 'Page created successfully');
        setShowForm(false);
        setEditingPage(null);
        resetForm();
        fetchPages();
      } else {
        toast.error(data.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      isPublished: page.isPublished,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Page deleted successfully');
        fetchPages();
      } else {
        toast.error(data.error || 'Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      const res = await fetch(`/api/admin/pages/${page._id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Page duplicated successfully');
        fetchPages();
      } else {
        toast.error(data.error || 'Failed to duplicate page');
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
    }
  };

  const togglePublished = async (page: Page) => {
    try {
      const res = await fetch(`/api/admin/pages/${page._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Page ${!page.isPublished ? 'published' : 'unpublished'}`);
        fetchPages();
      } else {
        toast.error(data.error || 'Failed to update page');
      }
    } catch (error) {
      console.error('Error toggling page:', error);
      toast.error('Failed to update page');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      seoTitle: '',
      seoDescription: '',
      isPublished: true,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPage(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages Management</h1>
          <p className="text-gray-600 mt-1">Create and manage custom pages for your website</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/homepage"
            className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
          >
            🏠 Homepage
          </Link>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-6 py-3 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
          >
            + Add Page
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">All Pages</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPage ? 'Edit Page' : 'Create New Page'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="page-slug"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL: /{formData.slug}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-sm"
                  placeholder="Page content (HTML or Markdown supported)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags or Markdown syntax
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      maxLength={60}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="SEO optimized title (max 60 chars)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      maxLength={160}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="SEO meta description (max 160 chars)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Published (visible on website)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingPage ? 'Update Page' : 'Create Page'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (formData.title && formData.content) {
                      setPreviewPage({
                        _id: editingPage?._id || 'preview',
                        title: formData.title,
                        slug: formData.slug || 'preview',
                        content: formData.content,
                        seoTitle: formData.seoTitle,
                        seoDescription: formData.seoDescription,
                        isPublished: formData.isPublished,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                    } else {
                      toast.error('Please fill in title and content to preview');
                    }
                  }}
                  className="px-6 py-3 bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                >
                  👁️ Preview
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pages Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duplicate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No pages found. Create your first page!
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{page.title}</div>
                        {page.seoTitle && (
                          <div className="text-xs text-gray-500 mt-1">{page.seoTitle}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="text-sm text-amber-600 hover:text-amber-900"
                        >
                          /{page.slug}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePublished(page)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            page.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPreviewPage(page)}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                            title="Preview page"
                          >
                            👁️ Preview
                          </button>
                          <button
                            onClick={() => handleEdit(page)}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(page._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDuplicate(page)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-sm hover:shadow-md"
                          title="Create a copy of this page"
                        >
                          📋 Duplicate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-green-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Page Preview</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Previewing: <span className="font-semibold">{previewPage.title}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${previewPage.slug}`}
                  target="_blank"
                  className="px-4 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors border border-green-200"
                >
                  Open in New Tab →
                </Link>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
                {/* Page Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{previewPage.title}</h1>
                  {previewPage.seoTitle && (
                    <p className="text-lg text-gray-600">{previewPage.seoTitle}</p>
                  )}
                  {previewPage.seoDescription && (
                    <p className="text-sm text-gray-500 mt-2">{previewPage.seoDescription}</p>
                  )}
                </div>

                {/* Page Content */}
                {previewPage.content.includes('<') || previewPage.content.includes('</') ? (
                  <div 
                    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-amber-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: previewPage.content }}
                  />
                ) : (
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                    {previewPage.content.split('\n').map((line, idx) => (
                      <p key={idx} className={line.trim() ? 'mb-4' : 'mb-2'}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Slug:</span> /{previewPage.slug}
                <span className="mx-2">•</span>
                <span className="font-medium">Status:</span>{' '}
                <span className={previewPage.isPublished ? 'text-green-600' : 'text-gray-500'}>
                  {previewPage.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <button
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

