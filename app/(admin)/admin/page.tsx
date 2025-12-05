'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

interface Stats {
  totalBanners: number;
  activeBanners: number;
  totalLocations: number;
  activeLocations: number;
  totalBusinesses: number;
  featuredBusinesses: number;
  totalCategories: number;
  totalOffers: number;
  activeOffers: number;
  totalPages: number;
  publishedPages: number;
  totalMessages: number;
  newMessages: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          bannersRes,
          locationsRes,
          businessesRes,
          categoriesRes,
          offersRes,
          pagesRes,
          messagesRes,
          usersRes,
        ] = await Promise.all([
          fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/locations', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/businesses', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/offers', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/pages', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const [
          bannersData,
          locationsData,
          businessesData,
          categoriesData,
          offersData,
          pagesData,
          messagesData,
          usersData,
        ] = await Promise.all([
          bannersRes.json(),
          locationsRes.json(),
          businessesRes.json(),
          categoriesRes.json(),
          offersRes.json(),
          pagesRes.json(),
          messagesRes.json(),
          usersRes.json(),
        ]);

        const banners = bannersData.banners || [];
        const businesses = businessesData.businesses || [];
        const offers = offersData.offers || [];
        const pages = pagesData.pages || [];
        const messages = messagesData.messages || [];

        setStats({
          totalBanners: banners.length,
          activeBanners: banners.filter((b: any) => b.isActive).length,
          totalLocations: locationsData.locations?.length || 0,
          activeLocations: locationsData.locations?.filter((l: any) => l.isActive).length || 0,
          totalBusinesses: businesses.length,
          featuredBusinesses: businesses.filter((b: any) => b.isFeatured).length,
          totalCategories: categoriesData.categories?.length || 0,
          totalOffers: offers.length,
          activeOffers: offers.filter((o: any) => o.isActive).length,
          totalPages: pages.length,
          publishedPages: pages.filter((p: any) => p.isPublished).length,
          totalMessages: messages.length,
          newMessages: messages.filter((m: any) => m.status === 'new').length,
          totalUsers: usersData.users?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your website.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/admin/businesses"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Businesses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalBusinesses || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.featuredBusinesses || 0} featured</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/banners"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Shop Images</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalBanners || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.activeBanners || 0} active</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/offers"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Offers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalOffers || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.activeOffers || 0} active</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/inbox"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer relative"
        >
          {stats && stats.newMessages > 0 && (
            <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          )}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Messages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalMessages || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.newMessages || 0} new</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalCategories || 0}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Locations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalLocations || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.activeLocations || 0} active</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Pages</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalPages || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{stats?.publishedPages || 0} published</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/analytics"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Analytics</h2>
          <p className="text-sm text-gray-600">View comprehensive statistics and metrics</p>
        </Link>

        <Link
          href="/admin/businesses"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Businesses</h2>
          <p className="text-sm text-gray-600">Manage business listings and profiles</p>
        </Link>

        <Link
          href="/admin/users"
          className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-pink-300 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Users</h2>
          <p className="text-sm text-gray-600">Manage user accounts and permissions</p>
        </Link>
      </div>
    </div>
  );
}

