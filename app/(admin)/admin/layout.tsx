'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // First check if user is logged in
      if (!token) {
        router.push('/login?redirect=/admin');
        return;
      }

      // Verify user role from server (in case it was updated in DB)
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          router.push('/login?redirect=/admin');
          return;
        }

        const data = await res.json();
        const currentUser = data.user || data; // Handle both response formats

        if (!currentUser || !currentUser.role) {
          router.push('/login?redirect=/admin');
          return;
        }

        // Update user in context if role changed
        if (currentUser.role !== user?.role) {
          updateUser(currentUser);
        }

        // Check if user is admin
        if (currentUser.role !== 'admin') {
          setError('Access Denied: Admin privileges required');
          toast.error('You need admin privileges to access this page');
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Failed to verify admin access');
        router.push('/login?redirect=/admin');
      }
    };

    checkAdminAccess();
  }, [token, router, user, updateUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Access Denied</div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  type NavigationItem = {
    name: string;
    href: string;
    icon: string;
    category: string;
  };

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: '📊', category: 'main' },
    { name: 'Adding Shop', href: '/admin/location-images', icon: '🗺️', category: 'main' },
    { name: 'Shop Images', href: '/admin/banners', icon: '🖼️', category: 'main' },
    { name: 'Homepage', href: '/admin/homepage', icon: '🏠', category: 'content' },
    { name: 'Businesses', href: '/admin/businesses', icon: '🏪', category: 'content' },
    { name: 'Categories', href: '/admin/categories', icon: '📁', category: 'content' },
    { name: 'Offers', href: '/admin/offers', icon: '🎁', category: 'content' },
    { name: 'Pages', href: '/admin/pages', icon: '📄', category: 'content' },
    { name: 'Pincodes', href: '/admin/locations', icon: '📍', category: 'settings' },
    { name: 'Distance Config', href: '/admin/distance', icon: '📏', category: 'settings' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈', category: 'tools' },
    { name: 'Inbox', href: '/admin/inbox', icon: '📧', category: 'tools' },
    { name: 'Users', href: '/admin/users', icon: '👥', category: 'tools' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          flex flex-col shadow-2xl
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-900">
          <Link
            href="/admin"
            className="flex items-center gap-2 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 bg-custom-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-gray-900">8</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <span className="text-xs text-gray-400">8 Rupeess</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const active = isActive(item.href);
            const prevItem = index > 0 ? navigation[index - 1] : null;
            const isFirstInCategory = index === 0 || (prevItem && prevItem.category !== item.category);
            
            return (
              <div key={item.name}>
                {isFirstInCategory && index > 0 && (
                  <div className="px-3 py-2 mt-4 mb-2">
                    <div className="h-px bg-gray-700"></div>
                  </div>
                )}
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${
                      active
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border-l-2 border-amber-400'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                    }
                  `}
                >
                  <span className={`text-lg flex-shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                  {active && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3 px-3 py-3 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors">
            <div className="w-10 h-10 bg-custom-gradient rounded-full flex items-center justify-center text-gray-900 font-bold text-sm shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1 lg:flex-none"></div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 hover:shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Site
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

