'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Category } from '../types';
import { useLocation } from '../contexts/LocationContext';

// Professional Icon components for categories
const CategoryIcon = ({ categorySlug, className }: { categorySlug: string; className?: string }) => {
  const iconClass = `w-16 h-16 ${className || ''}`;
  
  switch (categorySlug) {
    case 'restaurants':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <circle cx="12" cy="10" r="4" fill="#F59E0B"/>
          <path d="M8 14L9 18L11 17L10 20L12 21L14 20L13 17L15 18L16 14" fill="#F59E0B"/>
          <path d="M10 8L11 9L12 8L13 9L14 8" stroke="#F59E0B" strokeWidth="1.5" fill="none"/>
        </svg>
      );
    case 'hotels':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="10" width="18" height="10" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1"/>
          <rect x="5" y="12" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="9" y="12" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="13" y="12" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="17" y="12" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="5" y="15.5" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="9" y="15.5" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="13" y="15.5" width="2.5" height="2.5" fill="#1E40AF"/>
          <rect x="17" y="15.5" width="2.5" height="2.5" fill="#1E40AF"/>
          <path d="M3 10L12 3L21 10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <circle cx="12" cy="5" r="1.5" fill="#F59E0B"/>
          <text x="12" y="8" textAnchor="middle" fontSize="4" fill="#1E40AF" fontWeight="bold">HOTEL</text>
        </svg>
      );
    case 'beauty-spa':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FBCFE8" stroke="#EC4899" strokeWidth="1"/>
          <circle cx="12" cy="10" r="5" fill="#FDF2F8"/>
          <circle cx="10" cy="9" r="1.5" fill="#EC4899"/>
          <circle cx="14" cy="9" r="1.5" fill="#EC4899"/>
          <path d="M10 12Q12 13 14 12" stroke="#EC4899" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M12 14L11 17L13 17L12 14Z" fill="#EC4899"/>
          <circle cx="11" cy="7" r="0.8" fill="#EC4899"/>
        </svg>
      );
    case 'home-decor':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="11" width="14" height="10" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
          <rect x="7" y="13" width="10" height="6" fill="#DBEAFE"/>
          <rect x="8.5" y="14.5" width="7" height="3" fill="#1E40AF"/>
          <rect x="1" y="18" width="5" height="3" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="2" y="19" width="3" height="1.5" fill="#F59E0B"/>
          <circle cx="2.5" cy="16.5" r="1.2" fill="#FCD34D"/>
        </svg>
      );
    case 'wedding-planning':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="4" width="20" height="16" fill="#A78BFA" stroke="#7C3AED" strokeWidth="1"/>
          <circle cx="8" cy="10" r="2.5" fill="#FDF2F8"/>
          <circle cx="16" cy="10" r="2.5" fill="#FDF2F8"/>
          <path d="M8 12L12 14L16 12" stroke="#7C3AED" strokeWidth="1.5" fill="none"/>
          <text x="12" y="18" textAnchor="middle" fontSize="5" fill="#FDF2F8" fontWeight="bold">WEDDING</text>
        </svg>
      );
    case 'education':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
          <path d="M2 7V16L12 21L22 16V7" fill="#34D399" stroke="#059669" strokeWidth="1"/>
          <path d="M12 2L12 12" stroke="#059669" strokeWidth="1"/>
          <circle cx="12" cy="5" r="1" fill="#FCD34D"/>
        </svg>
      );
    case 'rent-hire':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="5" width="10" height="14" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
          <path d="M9 7L12 10L15 7" stroke="#1E40AF" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="2.5" fill="#1E40AF"/>
          <path d="M12 9.5V14.5" stroke="#1E40AF" strokeWidth="1.5"/>
          <path d="M10.5 12H13.5" stroke="#1E40AF" strokeWidth="1.5"/>
        </svg>
      );
    case 'hospitals':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="7" width="18" height="14" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1"/>
          <path d="M3 7L12 2L21 7" fill="#DC2626"/>
          <path d="M12 10V14M10 12H14" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="12" cy="18" r="2" fill="#DC2626"/>
        </svg>
      );
    case 'contractors':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="7" r="3.5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="5" y="11" width="14" height="10" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="7" y="13" width="10" height="6" fill="#FEF3C7"/>
          <rect x="9" y="15" width="6" height="2" fill="#1E40AF"/>
          <rect x="9" y="17.5" width="6" height="1" fill="#1E40AF"/>
        </svg>
      );
    case 'pet-shops':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="11" width="14" height="10" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
          <path d="M5 11L12 6L19 11" fill="#3B82F6"/>
          <circle cx="9" cy="15" r="1.5" fill="#1E40AF"/>
          <circle cx="15" cy="15" r="1.5" fill="#1E40AF"/>
          <path d="M10 18Q12 19 14 18" stroke="#1E40AF" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'pg-hostels':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="10" width="9" height="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="12" y="5" width="9" height="16" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="4.5" y="12" width="6" height="2" fill="#F59E0B"/>
          <rect x="4.5" y="15" width="6" height="2" fill="#F59E0B"/>
          <rect x="13.5" y="7" width="6" height="2" fill="#F59E0B"/>
          <rect x="13.5" y="10" width="6" height="2" fill="#F59E0B"/>
          <rect x="13.5" y="13" width="6" height="2" fill="#F59E0B"/>
        </svg>
      );
    case 'estate-agent':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="7" r="3.5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="5" y="12" width="14" height="9" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
          <rect x="7" y="14" width="10" height="5" fill="#DBEAFE"/>
          <rect x="8.5" y="15.5" width="7" height="2" fill="#1E40AF"/>
        </svg>
      );
    case 'dentists':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="12" rx="8" ry="9" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="1.5"/>
          <circle cx="9.5" cy="10" r="1.2" fill="#3B82F6"/>
          <circle cx="14.5" cy="10" r="1.2" fill="#3B82F6"/>
          <path d="M9.5 13Q12 14.5 14.5 13" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <circle cx="17" cy="6" r="2.5" fill="#3B82F6"/>
          <path d="M17 5V7M16 6H18" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      );
    case 'gym':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" fill="#10B981" stroke="#059669" strokeWidth="1"/>
          <rect x="7" y="7" width="10" height="10" rx="1" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="9" y="9" width="6" height="6" rx="0.5" fill="#10B981"/>
          <circle cx="12" cy="12" r="1.5" fill="#FCD34D"/>
        </svg>
      );
    case 'loans':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L4 7L12 11L20 7L12 3Z" fill="#10B981" stroke="#059669" strokeWidth="1"/>
          <circle cx="12" cy="17" r="5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <text x="12" y="20" textAnchor="middle" fontSize="7" fill="#10B981" fontWeight="bold">₹</text>
          <circle cx="12" cy="14" r="1.5" fill="#10B981"/>
          <circle cx="12" cy="20" r="1.5" fill="#10B981"/>
        </svg>
      );
    case 'event-organisers':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 10L5 8L7 10L9 8L11 10L13 8L15 10L17 8L19 10L21 8" stroke="#EC4899" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M3 14L5 12L7 14L9 12L11 14L13 12L15 14L17 12L19 14L21 12" stroke="#FCD34D" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M3 18L5 16L7 18L9 16L11 18L13 16L15 18L17 16L19 18L21 16" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    case 'driving-schools':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="13" width="18" height="7" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1"/>
          <circle cx="7.5" cy="19.5" r="2.5" fill="#1E40AF"/>
          <circle cx="16.5" cy="19.5" r="2.5" fill="#1E40AF"/>
          <rect x="5" y="11" width="14" height="4" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1"/>
          <circle cx="12" cy="9" r="2.5" fill="#1E40AF"/>
          <rect x="10" y="12" width="4" height="1.5" fill="#1E40AF"/>
        </svg>
      );
    case 'packers-movers':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="9" width="18" height="11" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="5" y="11" width="5" height="5" fill="#F59E0B"/>
          <rect x="12" y="11" width="5" height="5" fill="#F59E0B"/>
          <rect x="19" y="11" width="1" height="5" fill="#F59E0B"/>
          <circle cx="7" cy="21.5" r="2.5" fill="#1E40AF"/>
          <circle cx="17" cy="21.5" r="2.5" fill="#1E40AF"/>
          <rect x="4" y="7" width="16" height="3" fill="#F59E0B"/>
        </svg>
      );
    case 'courier-service':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="11" r="7" fill="#DC2626" stroke="#991B1B" strokeWidth="1"/>
          <rect x="8" y="15" width="8" height="6" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
          <rect x="10" y="17" width="4" height="2" fill="#F59E0B"/>
          <circle cx="12" cy="11" r="2" fill="#FCD34D"/>
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1"/>
          <path d="M8 8H16M8 12H16M8 16H12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
  }
};

export default function CategoryGrid() {
  const { location } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/categories?loc=${location.id}`);
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [location.id]);

  const handleCategoryClick = (category: Category) => {
    router.push(`/search?cat=${category.slug}&loc=${location.id}`);
  };

  if (isLoading) {
    return (
      <section className="py-8 px-2 sm:px-3 lg:px-4">
        <div className="max-w-[98%] mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-square mb-2 border border-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-2 sm:px-3 lg:px-4 bg-white">
      <div className="max-w-[98%] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Categories</h2>
          <button
            onClick={() => router.push(`/categories?loc=${location.id}`)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            See all categories →
          </button>
        </div>

        {/* Desktop: Grid - 10 columns */}
        <div className="hidden md:grid grid-cols-5 lg:grid-cols-10 gap-3">
          {categories.slice(0, 10).map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group bg-white rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Browse ${category.displayName} - ${category.itemCount} shops available`}
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-3 flex items-center justify-center h-16 w-16">
                  {category.iconUrl ? (
                    <Image
                      src={category.iconUrl}
                      alt={category.displayName}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  ) : (
                    <CategoryIcon categorySlug={category.slug} />
                  )}
                  {category.sponsored && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded">
                      Ad
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900 text-center leading-tight">
                  {category.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tablet: 5 columns */}
        <div className="hidden sm:grid md:hidden grid-cols-5 gap-3">
          {categories.slice(0, 10).map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className="group bg-white rounded-lg p-3 hover:shadow-md hover:border-blue-300 transition-all duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Browse ${category.displayName} - ${category.itemCount} shops available`}
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-2 flex items-center justify-center h-14 w-14">
                  {category.iconUrl ? (
                    <Image
                      src={category.iconUrl}
                      alt={category.displayName}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  ) : (
                    <CategoryIcon categorySlug={category.slug} className="w-14 h-14" />
                  )}
                  {category.sponsored && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 rounded">
                      Ad
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-gray-900 text-center leading-tight">
                  {category.displayName}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile: Horizontal Scroll */}
        <div className="sm:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="shrink-0 bg-white rounded-lg p-3 hover:shadow-md transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
                aria-label={`Browse ${category.displayName} - ${category.itemCount} shops available`}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-2 flex items-center justify-center h-12 w-12">
                    {category.iconUrl ? (
                      <Image
                        src={category.iconUrl}
                        alt={category.displayName}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <CategoryIcon categorySlug={category.slug} className="w-12 h-12" />
                    )}
                    {category.sponsored && (
                      <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 rounded">
                        Ad
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-gray-900 text-center leading-tight">
                    {category.displayName}
                  </div>
                </div>
              </button>
            ))}
            <button
              onClick={() => router.push(`/categories?loc=${location.id}`)}
              className="shrink-0 bg-white rounded-lg p-3 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all min-w-[100px] flex flex-col items-center justify-center"
            >
              <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-semibold text-gray-600">See All</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
