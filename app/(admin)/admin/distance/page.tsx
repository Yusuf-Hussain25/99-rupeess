'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';

interface DistanceConfig {
  _id: string;
  maxDistanceKm: number;
  defaultDistanceKm: number;
  distanceUnit: 'km' | 'miles';
}

export default function DistancePage() {
  const { token } = useAuth();
  const [config, setConfig] = useState<DistanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    maxDistanceKm: 10,
    defaultDistanceKm: 5,
    distanceUnit: 'km' as 'km' | 'miles',
  });

  useEffect(() => {
    if (token) {
      fetchConfig();
    }
  }, [token]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/distance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setFormData({
          maxDistanceKm: data.config.maxDistanceKm || 10,
          defaultDistanceKm: data.config.defaultDistanceKm || 5,
          distanceUnit: data.config.distanceUnit || 'km',
        });
      }
    } catch (error) {
      console.error('Error fetching distance config:', error);
      toast.error('Failed to fetch distance configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/distance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Distance configuration updated successfully');
        setConfig(data.config);
      } else {
        toast.error(data.error || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error saving distance config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Distance Configuration</h1>
        <p className="text-gray-600 mt-1">
          Configure distance settings for location-based business searches
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance ({formData.distanceUnit === 'km' ? 'Kilometers' : 'Miles'})
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.1"
              value={formData.maxDistanceKm}
              onChange={(e) =>
                setFormData({ ...formData, maxDistanceKm: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum distance users can search for nearby businesses
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Distance ({formData.distanceUnit === 'km' ? 'Kilometers' : 'Miles'})
            </label>
            <input
              type="number"
              required
              min="1"
              step="0.1"
              value={formData.defaultDistanceKm}
              onChange={(e) =>
                setFormData({ ...formData, defaultDistanceKm: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Default distance used when users don't specify a distance
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance Unit
            </label>
            <select
              value={formData.distanceUnit}
              onChange={(e) =>
                setFormData({ ...formData, distanceUnit: e.target.value as 'km' | 'miles' })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="km">Kilometers (km)</option>
              <option value="miles">Miles</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Unit of measurement displayed to users
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>Maximum Distance:</strong> The farthest distance users can search for businesses.
              This prevents extremely long search queries.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>Default Distance:</strong> When users search for "nearby" businesses without
              specifying a distance, this value is used.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>
              <strong>Distance Unit:</strong> Choose whether to display distances in kilometers or
              miles to your users.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

