'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';

interface LeftBarItem {
  title: string;
  link: string;
  imageUrl?: string;
  order?: number;
}

interface RightBarItem {
  title: string;
  link: string;
  imageUrl?: string;
  order?: number;
}

interface LayoutConfig {
  _id: string;
  leftBarContent: LeftBarItem[];
  rightBarContent: RightBarItem[];
  bottomStripText: string;
  bottomStripLink?: string;
  featuredBusinessIds: string[];
}

export default function LayoutPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [config, setConfig] = useState<LayoutConfig>({
    _id: '',
    leftBarContent: [],
    rightBarContent: [],
    bottomStripText: '',
    bottomStripLink: '',
    featuredBusinessIds: [],
  });

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [configRes, businessesRes] = await Promise.all([
        fetch('/api/admin/layout', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/businesses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [configData, businessesData] = await Promise.all([
        configRes.json(),
        businessesRes.json(),
      ]);

      if (configData.success) {
        setConfig(configData.config || {
          _id: '',
          leftBarContent: [],
          rightBarContent: [],
          bottomStripText: '',
          featuredBusinessIds: [],
        });
      }

      if (businessesData.success) {
        setBusinesses(businessesData.businesses || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/layout', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Layout configuration saved');
        setConfig(data.config);
      } else {
        toast.error(data.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addLeftBarItem = () => {
    setConfig({
      ...config,
      leftBarContent: [
        ...config.leftBarContent,
        { title: '', link: '', order: config.leftBarContent.length },
      ],
    });
  };

  const addRightBarItem = () => {
    setConfig({
      ...config,
      rightBarContent: [
        ...config.rightBarContent,
        { title: '', link: '', order: config.rightBarContent.length },
      ],
    });
  };

  const updateLeftBarItem = (index: number, field: string, value: string) => {
    const updated = [...config.leftBarContent];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, leftBarContent: updated });
  };

  const updateRightBarItem = (index: number, field: string, value: string) => {
    const updated = [...config.rightBarContent];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, rightBarContent: updated });
  };

  const removeLeftBarItem = (index: number) => {
    setConfig({
      ...config,
      leftBarContent: config.leftBarContent.filter((_, i) => i !== index),
    });
  };

  const removeRightBarItem = (index: number) => {
    setConfig({
      ...config,
      rightBarContent: config.rightBarContent.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Layout Configuration</h1>
          <p className="text-gray-600 mt-1">Manage left bar, right bar, bottom strip, and featured businesses</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-custom-gradient text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Left Bar Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Left Bar Content</h2>
            <button
              onClick={addLeftBarItem}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-4">
            {config.leftBarContent.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateLeftBarItem(index, 'title', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Link URL"
                    value={item.link}
                    onChange={(e) => updateLeftBarItem(index, 'link', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={item.imageUrl || ''}
                    onChange={(e) => updateLeftBarItem(index, 'imageUrl', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={() => removeLeftBarItem(index)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            {config.leftBarContent.length === 0 && (
              <p className="text-gray-500 text-sm">No items added yet</p>
            )}
          </div>
        </div>

        {/* Right Bar Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Right Bar Content</h2>
            <button
              onClick={addRightBarItem}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-4">
            {config.rightBarContent.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => updateRightBarItem(index, 'title', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Link URL"
                    value={item.link}
                    onChange={(e) => updateRightBarItem(index, 'link', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={item.imageUrl || ''}
                    onChange={(e) => updateRightBarItem(index, 'imageUrl', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={() => removeRightBarItem(index)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
            {config.rightBarContent.length === 0 && (
              <p className="text-gray-500 text-sm">No items added yet</p>
            )}
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bottom Strip</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <input
                type="text"
                value={config.bottomStripText}
                onChange={(e) => setConfig({ ...config, bottomStripText: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Special offer today, click here!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (optional)</label>
              <input
                type="text"
                value={config.bottomStripLink || ''}
                onChange={(e) => setConfig({ ...config, bottomStripLink: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="/offers"
              />
            </div>
          </div>
        </div>

        {/* Featured Businesses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Businesses</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Featured Businesses</label>
            <select
              multiple
              value={config.featuredBusinessIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setConfig({ ...config, featuredBusinessIds: selected });
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 min-h-[200px]"
            >
              {businesses.map((business) => (
                <option key={business._id} value={business._id}>
                  {business.name} - {business.area}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple businesses</p>
          </div>
        </div>
      </div>
    </div>
  );
}

