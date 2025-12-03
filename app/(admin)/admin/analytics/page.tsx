'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface AnalyticsStats {
  totalBanners: number;
  activeBanners: number;
  totalBusinesses: number;
  featuredBusinesses: number;
  totalCategories: number;
  totalLocations: number;
  activeLocations: number;
  totalOffers: number;
  activeOffers: number;
  totalPages: number;
  publishedPages: number;
  totalMessages: number;
  newMessages: number;
  totalUsers: number;
  adminUsers: number;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [
        bannersRes,
        businessesRes,
        categoriesRes,
        locationsRes,
        offersRes,
        pagesRes,
        messagesRes,
        usersRes,
      ] = await Promise.all([
        fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/businesses', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/locations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/offers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/pages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [
        bannersData,
        businessesData,
        categoriesData,
        locationsData,
        offersData,
        pagesData,
        messagesData,
        usersData,
      ] = await Promise.all([
        bannersRes.json(),
        businessesRes.json(),
        categoriesRes.json(),
        locationsRes.json(),
        offersRes.json(),
        pagesRes.json(),
        messagesRes.json(),
        usersRes.json(),
      ]);

      const banners = bannersData.banners || [];
      const businesses = businessesData.businesses || [];
      const categories = categoriesData.categories || [];
      const locations = locationsData.locations || [];
      const offers = offersData.offers || [];
      const pages = pagesData.pages || [];
      const messages = messagesData.messages || [];
      const users = usersData.users || [];

      setStats({
        totalBanners: banners.length,
        activeBanners: banners.filter((b: any) => b.isActive).length,
        totalBusinesses: businesses.length,
        featuredBusinesses: businesses.filter((b: any) => b.isFeatured).length,
        totalCategories: categories.length,
        totalLocations: locations.length,
        activeLocations: locations.filter((l: any) => l.isActive).length,
        totalOffers: offers.length,
        activeOffers: offers.filter((o: any) => o.isActive).length,
        totalPages: pages.length,
        publishedPages: pages.filter((p: any) => p.isPublished).length,
        totalMessages: messages.length,
        newMessages: messages.filter((m: any) => m.status === 'new').length,
        totalUsers: users.length,
        adminUsers: users.filter((u: any) => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Banners',
      items: [
        { label: 'Total Banners', value: stats.totalBanners, color: 'blue' },
        { label: 'Active Banners', value: stats.activeBanners, color: 'green' },
      ],
    },
    {
      title: 'Businesses',
      items: [
        { label: 'Total Businesses', value: stats.totalBusinesses, color: 'blue' },
        { label: 'Featured', value: stats.featuredBusinesses, color: 'purple' },
      ],
    },
    {
      title: 'Content',
      items: [
        { label: 'Categories', value: stats.totalCategories, color: 'blue' },
        { label: 'Pages', value: stats.totalPages, color: 'blue' },
        { label: 'Published Pages', value: stats.publishedPages, color: 'green' },
      ],
    },
    {
      title: 'Locations',
      items: [
        { label: 'Total Locations', value: stats.totalLocations, color: 'blue' },
        { label: 'Active Locations', value: stats.activeLocations, color: 'green' },
      ],
    },
    {
      title: 'Offers',
      items: [
        { label: 'Total Offers', value: stats.totalOffers, color: 'blue' },
        { label: 'Active Offers', value: stats.activeOffers, color: 'green' },
      ],
    },
    {
      title: 'Users & Messages',
      items: [
        { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
        { label: 'Admins', value: stats.adminUsers, color: 'purple' },
        { label: 'Total Messages', value: stats.totalMessages, color: 'blue' },
        { label: 'New Messages', value: stats.newMessages, color: 'orange' },
      ],
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
    };
    return colors[color] || 'bg-gray-50 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your website statistics and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getColorClasses(item.color)}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Total Content</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats.totalBusinesses + stats.totalCategories + stats.totalPages}
              </p>
            </div>
            <div className="p-4 bg-blue-200 rounded-xl">
              <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 uppercase tracking-wide">Active Items</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats.activeBanners + stats.activeOffers + stats.activeLocations}
              </p>
            </div>
            <div className="p-4 bg-green-200 rounded-xl">
              <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wide">Users</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-purple-600 mt-1">{stats.adminUsers} admins</p>
            </div>
            <div className="p-4 bg-purple-200 rounded-xl">
              <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 uppercase tracking-wide">New Messages</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.newMessages}</p>
              <p className="text-xs text-orange-600 mt-1">of {stats.totalMessages} total</p>
            </div>
            <div className="p-4 bg-orange-200 rounded-xl">
              <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

