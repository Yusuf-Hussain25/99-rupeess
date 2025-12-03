'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface Banner {
  _id: string;
  section: 'hero' | 'left' | 'right' | 'top' | 'bottom';
  imageUrl: string;
  title?: string;
  linkUrl: string;
  lat?: number;
  lng?: number;
  area?: string;
  pincode?: number;
  position?: number;
  isActive: boolean;
  advertiser?: string;
}

interface HomepageVariant {
  _id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
}

export default function HomepagePage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [homepageVariants, setHomepageVariants] = useState<HomepageVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [banners, setBanners] = useState<Record<string, Banner[]>>({
    hero: [],
    left: [],
    right: [],
    top: [],
    bottom: [],
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSlug, setDuplicateSlug] = useState('');
  const [activeSection, setActiveSection] = useState<'hero' | 'left' | 'right' | 'top' | 'bottom'>('hero');
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    section: 'hero' as 'hero' | 'left' | 'right' | 'top' | 'bottom',
    imageUrl: '',
    title: '',
    linkUrl: '#',
    lat: '',
    lng: '',
    area: '',
    pincode: '',
    position: 0,
    isActive: true,
    advertiser: '',
  });

  useEffect(() => {
    if (token) {
      fetchHomepageVariants();
    }
  }, [token]);

  useEffect(() => {
    // Auto-create default homepage if none exists
    if (!loading && token && homepageVariants.length === 0) {
      createDefaultHomepage();
    }
  }, [loading, homepageVariants.length, token]);

  const createDefaultHomepage = async () => {
    try {
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Homepage',
          slug: 'home',
          content: JSON.stringify({ type: 'homepage' }),
          isPublished: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchHomepageVariants();
      }
    } catch (error) {
      console.error('Error creating default homepage:', error);
    }
  };

  useEffect(() => {
    if (selectedVariant) {
      fetchBannersForVariant();
    }
  }, [selectedVariant, token]);

  const fetchHomepageVariants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Filter homepage variants (slug starts with 'home' or is 'home')
        const variants = (data.pages || []).filter((p: any) => 
          p.slug === 'home' || p.slug.startsWith('home-') || p.slug === 'homepage'
        );
        setHomepageVariants(variants);
        if (variants.length > 0 && !selectedVariant) {
          setSelectedVariant(variants[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching homepage variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannersForVariant = async () => {
    if (!selectedVariant) return;
    try {
      const variant = homepageVariants.find(v => v._id === selectedVariant);
      if (!variant) return;

      // Fetch banners for all sections
      const sections: Array<'hero' | 'left' | 'right' | 'top' | 'bottom'> = ['hero', 'left', 'right', 'top', 'bottom'];
      const bannerPromises = sections.map(section =>
        fetch(`/api/admin/banners?section=${section}${variant.slug !== 'home' ? `&locationId=${variant.slug}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => res.json())
      );

      const results = await Promise.all(bannerPromises);
      const newBanners: Record<string, Banner[]> = {
        hero: [],
        left: [],
        right: [],
        top: [],
        bottom: [],
      };

      results.forEach((data, index) => {
        if (data.success && data.banners) {
          newBanners[sections[index]] = data.banners.sort((a: Banner, b: Banner) => 
            (a.position || 0) - (b.position || 0)
          );
        }
      });

      setBanners(newBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!duplicateSlug.trim()) {
      toast.error('Please enter a slug for the new homepage');
      return;
    }

    try {
      const originalVariant = homepageVariants.find(v => v._id === selectedVariant);
      if (!originalVariant) {
        toast.error('No homepage selected to duplicate');
        return;
      }

      // Create new homepage variant
      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Homepage - ${duplicateSlug}`,
          slug: `home-${duplicateSlug}`,
          content: JSON.stringify({ duplicatedFrom: originalVariant._id }),
          isPublished: false,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Duplicate all banners for this variant
        const sections: Array<'hero' | 'left' | 'right' | 'top' | 'bottom'> = ['hero', 'left', 'right', 'top', 'bottom'];
        for (const section of sections) {
          for (const banner of banners[section]) {
            const { _id, createdAt, updatedAt, ...bannerData } = banner;
            await fetch('/api/admin/banners', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...bannerData,
                locationId: `home-${duplicateSlug}`,
              }),
            });
          }
        }

        toast.success('Homepage duplicated successfully!');
        setShowDuplicateModal(false);
        setDuplicateSlug('');
        fetchHomepageVariants();
      } else {
        toast.error(data.error || 'Failed to duplicate homepage');
      }
    } catch (error) {
      console.error('Error duplicating homepage:', error);
      toast.error('Failed to duplicate homepage');
    }
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const variant = homepageVariants.find(v => v._id === selectedVariant);
      const bannerData = {
        section: bannerFormData.section,
        imageUrl: bannerFormData.imageUrl,
        title: bannerFormData.title || undefined,
        linkUrl: bannerFormData.linkUrl,
        lat: bannerFormData.lat ? parseFloat(bannerFormData.lat) : undefined,
        lng: bannerFormData.lng ? parseFloat(bannerFormData.lng) : undefined,
        area: bannerFormData.area || undefined,
        pincode: bannerFormData.pincode ? parseInt(bannerFormData.pincode) : undefined,
        position: bannerFormData.position,
        isActive: bannerFormData.isActive,
        advertiser: bannerFormData.advertiser || undefined,
        locationId: variant?.slug !== 'home' ? variant?.slug : undefined,
      };

      const url = editingBanner
        ? `/api/admin/banners/${editingBanner._id}`
        : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bannerData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner added successfully');
        setShowBannerForm(false);
        setEditingBanner(null);
        resetBannerForm();
        fetchBannersForVariant();
      } else {
        toast.error(data.error || 'Failed to save banner');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      section: banner.section,
      imageUrl: banner.imageUrl,
      title: banner.title || '',
      linkUrl: banner.linkUrl,
      lat: banner.lat?.toString() || '',
      lng: banner.lng?.toString() || '',
      area: banner.area || '',
      pincode: banner.pincode?.toString() || '',
      position: banner.position || 0,
      isActive: banner.isActive,
      advertiser: banner.advertiser || '',
    });
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Banner deleted successfully');
        fetchBannersForVariant();
      } else {
        toast.error(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const resetBannerForm = () => {
    setBannerFormData({
      section: activeSection,
      imageUrl: '',
      title: '',
      linkUrl: '#',
      lat: '',
      lng: '',
      area: '',
      pincode: '',
      position: 0,
      isActive: true,
      advertiser: '',
    });
  };

  const sections = [
    { key: 'hero' as const, name: 'Center (Hero)', icon: '🎯', color: 'purple' },
    { key: 'left' as const, name: 'Left Column', icon: '⬅️', color: 'blue' },
    { key: 'right' as const, name: 'Right Column', icon: '➡️', color: 'green' },
    { key: 'top' as const, name: 'Top Strip', icon: '⬆️', color: 'amber' },
    { key: 'bottom' as const, name: 'Bottom Strip', icon: '⬇️', color: 'red' },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Management</h1>
          <p className="text-gray-600 mt-1">Manage homepage sections, banners, and create variations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDuplicateModal(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
          >
            📋 Duplicate Homepage
          </button>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Homepage →
          </Link>
        </div>
      </div>

      {/* Homepage Variants Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Homepage Variant:</label>
        <div className="flex items-center gap-3 flex-wrap">
          {homepageVariants.map((variant) => (
            <button
              key={variant._id}
              onClick={() => setSelectedVariant(variant._id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedVariant === variant._id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {variant.title} ({variant.slug})
            </button>
          ))}
        </div>
      </div>

      {selectedVariant && (
        <>
          {/* Section Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => {
                    setActiveSection(section.key);
                    resetBannerForm();
                    setBannerFormData(prev => ({ ...prev, section: section.key }));
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeSection === section.key
                      ? `bg-${section.color}-100 text-${section.color}-700 border-2 border-${section.color}-300`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeSection === section.key
                      ? `bg-${section.color}-200 text-${section.color}-800`
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {banners[section.key]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Banners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Banners List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {sections.find(s => s.key === activeSection)?.name} Banners
                  </h2>
                  <button
                    onClick={() => {
                      resetBannerForm();
                      setShowBannerForm(true);
                    }}
                    className="px-4 py-2 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                  >
                    + Add Banner
                  </button>
                </div>

                <div className="space-y-4">
                  {banners[activeSection]?.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No banners in this section. Add your first banner!
                    </div>
                  ) : (
                    banners[activeSection]?.map((banner) => (
                      <div
                        key={banner._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                            {banner.imageUrl ? (
                              <Image
                                src={banner.imageUrl}
                                alt={banner.alt || banner.title || 'Banner'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {banner.title || 'Untitled Banner'}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{banner.linkUrl}</p>
                            {banner.lat && banner.lng && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {banner.lat.toFixed(4)}, {banner.lng.toFixed(4)}
                              </p>
                            )}
                            {banner.area && (
                              <p className="text-xs text-gray-500">📍 {banner.area}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                banner.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-500">Position: {banner.position || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBanner(banner)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Section Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Section Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Total Banners:</span>
                    <span className="ml-2 text-gray-900">{banners[activeSection]?.length || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Active Banners:</span>
                    <span className="ml-2 text-green-600">
                      {banners[activeSection]?.filter(b => b.isActive).length || 0}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {activeSection === 'hero' && 'Center hero banner - Main featured banner'}
                      {activeSection === 'left' && 'Left column - Vertical banner strip (4 banners)'}
                      {activeSection === 'right' && 'Right column - Vertical banner strip (4 banners)'}
                      {activeSection === 'top' && 'Top strip - Horizontal scrolling banners'}
                      {activeSection === 'bottom' && 'Bottom strip - Horizontal scrolling banners'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Duplicate Homepage</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Homepage Slug
                </label>
                <input
                  type="text"
                  value={duplicateSlug}
                  onChange={(e) => setDuplicateSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="new-variant"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL will be: /home-{duplicateSlug || 'new-variant'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDuplicate}
                  className="flex-1 px-6 py-3 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setDuplicateSlug('');
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
            </div>
            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  value={bannerFormData.section}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, section: e.target.value as any })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  {sections.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
                <input
                  type="url"
                  required
                  value={bannerFormData.imageUrl}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link URL *</label>
                <input
                  type="url"
                  required
                  value={bannerFormData.linkUrl}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={bannerFormData.lat}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, lat: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="25.5941"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={bannerFormData.lng}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, lng: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="85.1376"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                  <input
                    type="text"
                    value={bannerFormData.area}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, area: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="A.H. Guard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="number"
                    value={bannerFormData.pincode}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="801101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                  <input
                    type="number"
                    value={bannerFormData.position}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, position: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Advertiser</label>
                  <input
                    type="text"
                    value={bannerFormData.advertiser}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, advertiser: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={bannerFormData.isActive}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-custom-gradient text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBannerForm(false);
                    setEditingBanner(null);
                    resetBannerForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
