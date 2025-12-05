'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Banner {
  _id: string;
  section: 'hero' | 'left' | 'right' | 'top' | 'bottom' | 'slider' | 'latest-offers' | 'featured-businesses' | 'top-rated-businesses' | 'new-businesses';
  imageUrl: string;
  title?: string;
  cta?: string;
  ctaText?: string;
  linkUrl: string;
  alt?: string;
  advertiser?: string;
  sponsored: boolean;
  position?: number;
  area?: string;
  pincode?: number;
  locationId?: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
  order: number;
  rating?: number;
  reviews?: number;
}

interface Location {
  _id: string;
  id: string;
  displayName: string;
  area?: string;
  pincode?: number;
}

const SECTIONS = [
  { value: 'all', label: 'All Sections', icon: '📋' },
  { value: 'hero', label: 'Hero', icon: '🖼️' },
  { value: 'slider', label: 'Slider', icon: '🎠' },
  { value: 'left', label: 'Left Rail', icon: '⬅️' },
  { value: 'right', label: 'Right Rail', icon: '➡️' },
  { value: 'top', label: 'Top Strip', icon: '⬆️' },
  { value: 'bottom', label: 'Bottom Strip', icon: '⬇️' },
  { value: 'latest-offers', label: 'Latest Offers', icon: '🎁' },
  { value: 'featured-businesses', label: 'Featured', icon: '⭐' },
  { value: 'top-rated-businesses', label: 'Top Rated', icon: '🏆' },
  { value: 'new-businesses', label: 'New Businesses', icon: '🆕' },
];

export default function BannersPage() {
  const { token } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [formData, setFormData] = useState({
    section: 'hero' as Banner['section'],
    imageUrl: '',
    title: '',
    cta: '',
    ctaText: '',
    linkUrl: '#',
    alt: '',
    advertiser: '',
    sponsored: false,
    position: 0,
    area: '',
    pincode: '',
    locationId: '',
    lat: '',
    lng: '',
    isActive: true,
    order: 0,
    rating: '',
    reviews: '',
  });

  useEffect(() => {
    fetchBanners();
    fetchLocations();
  }, [token]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Failed to fetch locations');
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/banners', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
      }
    } catch (error) {
      toast.error('Failed to fetch shop images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', 'general');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner._id}`
        : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const submitData: any = {
        section: formData.section,
        imageUrl: formData.imageUrl,
        title: formData.title || undefined,
        cta: formData.cta || undefined,
        ctaText: formData.ctaText || undefined,
        linkUrl: formData.linkUrl,
        alt: formData.alt || undefined,
        advertiser: formData.advertiser || undefined,
        sponsored: formData.sponsored,
        position: formData.position || undefined,
        area: formData.area || undefined,
        pincode: formData.pincode ? parseInt(formData.pincode) : undefined,
        locationId: formData.locationId || undefined,
        lat: formData.lat ? parseFloat(formData.lat) : undefined,
        lng: formData.lng ? parseFloat(formData.lng) : undefined,
        isActive: formData.isActive,
        order: formData.order,
        rating: formData.rating ? parseFloat(formData.rating) : undefined,
        reviews: formData.reviews ? parseInt(formData.reviews) : undefined,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingBanner ? 'Shop image updated' : 'Shop image created');
        setShowForm(false);
        setEditingBanner(null);
        resetForm();
        fetchBanners();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Failed to save shop image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shop image?')) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Shop image deleted');
        fetchBanners();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      toast.error('Failed to delete shop image');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      section: banner.section,
      imageUrl: banner.imageUrl,
      title: banner.title || '',
      cta: banner.cta || '',
      ctaText: banner.ctaText || '',
      linkUrl: banner.linkUrl,
      alt: banner.alt || '',
      advertiser: banner.advertiser || '',
      sponsored: banner.sponsored,
      position: banner.position || 0,
      area: banner.area || '',
      pincode: banner.pincode?.toString() || '',
      locationId: banner.locationId || '',
      lat: banner.lat?.toString() || '',
      lng: banner.lng?.toString() || '',
      isActive: banner.isActive,
      order: banner.order,
      rating: banner.rating?.toString() || '',
      reviews: banner.reviews?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      section: 'hero',
      imageUrl: '',
      title: '',
      cta: '',
      ctaText: '',
      linkUrl: '#',
      alt: '',
      advertiser: '',
      sponsored: false,
      position: 0,
      area: '',
      pincode: '',
      locationId: '',
      lat: '',
      lng: '',
      isActive: true,
      order: 0,
      rating: '',
      reviews: '',
    });
  };

  // Filter banners by section and location
  const filteredBanners = banners.filter((banner) => {
    const sectionMatch = selectedSection === 'all' || banner.section === selectedSection;
    const locationMatch = selectedLocation === 'all' || banner.locationId === selectedLocation;
    return sectionMatch && locationMatch;
  });

  // Group banners by location for better organization
  const bannersByLocation = filteredBanners.reduce((acc, banner) => {
    const locationId = banner.locationId || 'no-location';
    if (!acc[locationId]) {
      acc[locationId] = [];
    }
    acc[locationId].push(banner);
    return acc;
  }, {} as Record<string, Banner[]>);

  const getLocationName = (locationId: string) => {
    if (locationId === 'no-location') return 'No Location Assigned';
    const location = locations.find(loc => loc.id === locationId);
    return location ? `${location.displayName}${location.pincode ? ` (${location.pincode})` : ''}` : locationId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Image Management</h1>
          <p className="text-gray-600 mt-1">Manage all shop images displayed on your website</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingBanner(null);
            setShowForm(true);
          }}
          className="px-6 py-3 bg-custom-gradient text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Shop Image
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBanner ? 'Edit Shop Image' : 'Create New Shop Image'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value as Banner['section'] })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                      required
                    >
                      <option value="hero">🖼️ Hero Shop Image (Center)</option>
                      <option value="slider">🎠 Slider Images</option>
                      <option value="left">⬅️ Left Rail</option>
                      <option value="right">➡️ Right Rail</option>
                      <option value="top">⬆️ Top Strip</option>
                      <option value="bottom">⬇️ Bottom Strip</option>
                      <option value="latest-offers">🎁 Latest Offers</option>
                      <option value="featured-businesses">⭐ Featured Businesses</option>
                      <option value="top-rated-businesses">🏆 Top Rated Businesses</option>
                      <option value="new-businesses">🆕 New Businesses</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shop Image *
                    </label>
                  
                  {/* Image Preview */}
                  {formData.imageUrl ? (
                    <div className="mb-4">
                      <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <Image
                          src={formData.imageUrl}
                          alt="Shop Image Preview"
                          fill
                          className="object-contain p-2"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-gray-900 rounded-full hover:bg-red-600 transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Image URL: {formData.imageUrl}</p>
                    </div>
                  ) : (
                    <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:border-amber-400 transition-colors">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="mt-4">
                          <label className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Choose image from your computer
                            </span>
                            <span className="mt-1 block text-xs text-gray-500">
                              PNG, JPG, GIF, WebP up to 5MB
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            <span className="mt-3 inline-block px-4 py-2 bg-custom-gradient text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                              {uploading ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </span>
                              ) : (
                                'Select Image'
                              )}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual URL Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Or enter image URL manually
                    </label>
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900"
                      placeholder="/Assets/image.jpg or /uploads/image.jpg"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Shop image title (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advertiser Name
                    </label>
                    <input
                      type="text"
                      value={formData.advertiser}
                      onChange={(e) => setFormData({ ...formData, advertiser: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      placeholder="Company/brand name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Offer Text / CTA Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900"
                    placeholder="e.g., '50% OFF', 'Save ₹500', 'MEGA SALE'"
                  />
                  <p className="text-xs text-gray-500 mt-1">Display text for offers and promotions</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL *
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-gray-900"
                    placeholder="/category/restaurants or https://example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Where users will be redirected when clicking the shop image</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <select
                      value={formData.locationId}
                      onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
                    >
                      <option value="">No Location</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.displayName} {loc.pincode ? `(${loc.pincode})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                      placeholder="e.g., A.H. Guard"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="number"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Rating and Reviews - for business sections */}
                {(formData.section === 'featured-businesses' || formData.section === 'top-rated-businesses' || 
                  formData.section === 'new-businesses' || formData.section === 'latest-offers') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reviews Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={(e) => setFormData({ ...formData, reviews: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
                        placeholder="50"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sponsored}
                      onChange={(e) => setFormData({ ...formData, sponsored: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Sponsored</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-custom-gradient text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                  >
                    {editingBanner ? 'Update Shop Image' : 'Create Shop Image'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBanner(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Section Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Section</label>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((section) => (
                <button
                  key={section.value}
                  onClick={() => setSelectedSection(section.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSection === section.value
                      ? 'bg-custom-gradient text-gray-900 shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white text-gray-900"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.displayName} {loc.pincode ? `(${loc.pincode})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Banners Grid - Organized by Location */}
      {Object.keys(bannersByLocation).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Shop Images Found</h3>
          <p className="text-gray-600 mb-6">Create your first shop image to get started!</p>
          <button
            onClick={() => {
              resetForm();
              setEditingBanner(null);
              setShowForm(true);
            }}
            className="px-6 py-3 bg-custom-gradient text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            Add Shop Image
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(bannersByLocation).map(([locationId, locationBanners]) => (
            <div key={locationId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Location Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{getLocationName(locationId)}</h3>
                      <p className="text-sm text-gray-600">{locationBanners.length} shop image{locationBanners.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banners Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {locationBanners.map((banner) => (
                    <div
                      key={banner._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all bg-white"
                    >
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gray-100">
                        <Image
                          src={banner.imageUrl}
                          alt={banner.alt || banner.title || 'Shop Image'}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            SECTIONS.find(s => s.value === banner.section) 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {SECTIONS.find(s => s.value === banner.section)?.icon || '📋'} {banner.section}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {banner.isActive ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {banner.advertiser || banner.title || 'Untitled'}
                          </h4>
                          {banner.ctaText && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{banner.ctaText}</p>
                          )}
                        </div>

                        {/* Rating & Reviews */}
                        {(banner.rating !== undefined || banner.reviews !== undefined) && (
                          <div className="flex items-center gap-3 text-xs">
                            {banner.rating !== undefined && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="font-medium text-gray-900">{banner.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {banner.reviews !== undefined && (
                              <div className="text-gray-600">
                                {banner.reviews} review{banner.reviews !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Location Info */}
                        <div className="text-xs text-gray-500 space-y-1">
                          {banner.area && <div>📍 {banner.area}</div>}
                          {banner.pincode && <div>📮 PIN: {banner.pincode}</div>}
                          {(banner.lat && banner.lng) && (
                            <div>🗺️ {banner.lat.toFixed(4)}, {banner.lng.toFixed(4)}</div>
                          )}
                        </div>

                        {/* Link */}
                        <div className="text-xs text-gray-400 truncate" title={banner.linkUrl}>
                          🔗 {banner.linkUrl}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="flex-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

