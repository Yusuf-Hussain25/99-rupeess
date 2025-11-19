'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Category } from '../types';
import { useLocation } from '../contexts/LocationContext';
import type { LucideIcon } from 'lucide-react';
import {
  BedDouble,
  Building,
  Building2,
  Car,
  Dumbbell,
  GraduationCap,
  Grid3X3,
  Hammer,
  HeartHandshake,
  Hospital,
  KeyRound,
  Lamp,
  Package,
  PartyPopper,
  PawPrint,
  PiggyBank,
  Smile,
  Sparkles,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';

type CategoryIconTheme = {
  Icon: LucideIcon;
  bg: string;
  fg: string;
};

const iconThemes: Record<string, CategoryIconTheme> = {
  restaurants: { Icon: UtensilsCrossed, bg: 'bg-amber-50', fg: 'text-amber-600' },
  hotels: { Icon: BedDouble, bg: 'bg-sky-50', fg: 'text-sky-600' },
  'beauty-spa': { Icon: Sparkles, bg: 'bg-pink-50', fg: 'text-pink-500' },
  'home-decor': { Icon: Lamp, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
  'wedding-planning': { Icon: HeartHandshake, bg: 'bg-purple-50', fg: 'text-purple-600' },
  education: { Icon: GraduationCap, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
  'rent-hire': { Icon: KeyRound, bg: 'bg-teal-50', fg: 'text-teal-600' },
  hospitals: { Icon: Hospital, bg: 'bg-rose-50', fg: 'text-rose-600' },
  contractors: { Icon: Hammer, bg: 'bg-amber-50', fg: 'text-amber-700' },
  'pet-shops': { Icon: PawPrint, bg: 'bg-orange-50', fg: 'text-orange-500' },
  'pg-hostels': { Icon: Building, bg: 'bg-blue-50', fg: 'text-blue-600' },
  'estate-agent': { Icon: Building2, bg: 'bg-slate-50', fg: 'text-slate-700' },
  dentists: { Icon: Smile, bg: 'bg-blue-50', fg: 'text-blue-500' },
  gym: { Icon: Dumbbell, bg: 'bg-lime-50', fg: 'text-lime-600' },
  loans: { Icon: PiggyBank, bg: 'bg-yellow-50', fg: 'text-yellow-600' },
  'event-organisers': { Icon: PartyPopper, bg: 'bg-fuchsia-50', fg: 'text-fuchsia-600' },
  'driving-schools': { Icon: Car, bg: 'bg-sky-50', fg: 'text-sky-600' },
  'packers-movers': { Icon: Package, bg: 'bg-amber-50', fg: 'text-amber-700' },
  'courier-service': { Icon: Truck, bg: 'bg-rose-50', fg: 'text-rose-600' },
};

const defaultTheme: CategoryIconTheme = {
  Icon: Grid3X3,
  bg: 'bg-slate-100',
  fg: 'text-slate-600',
};

const CategoryIcon = ({ categorySlug, className }: { categorySlug: string; className?: string }) => {
  const { Icon, bg, fg } = iconThemes[categorySlug] ?? defaultTheme;
  const sizeClass = className ?? 'w-16 h-16';

  return (
    <span
      className={`relative flex items-center justify-center rounded-2xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ${bg} ${sizeClass}`}
    >
      <Icon className={`w-[58%] h-[58%] ${fg}`} strokeWidth={1.8} />
      <span className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/40 to-transparent pointer-events-none" />
    </span>
  );
};

export default function CategoryGrid() {
  const { location } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllDropdown, setShowAllDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const params = new URLSearchParams({
      loc: location.id,
      city: location.city,
      locName: location.displayName,
    });
    router.push(`/${category.slug}?${params.toString()}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAllDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="flex items-center justify-between mb-6 relative" ref={dropdownRef}>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Categories</h2>
          <div className="relative">
            <button
              onClick={() => setShowAllDropdown((prev) => !prev)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              aria-expanded={showAllDropdown}
              aria-haspopup="true"
            >
              See all categories
              <svg
                className={`w-4 h-4 transition-transform ${showAllDropdown ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.25 3.84a.75.75 0 01-1.02 0l-4.25-3.84a.75.75 0 01.02-1.1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {showAllDropdown && (
              <div
                role="menu"
                className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-3 z-20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    All Categories ({categories.length})
                  </span>
                  <button
                    onClick={() => router.push(`/categories?loc=${location.id}`)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View page →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={`dropdown-${category.id}`}
                      onClick={() => {
                        setShowAllDropdown(false);
                        handleCategoryClick(category);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-all text-left"
                    >
                      <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                        {category.iconUrl ? (
                          <Image
                            src={category.iconUrl}
                            alt={category.displayName}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <CategoryIcon categorySlug={category.slug} className="w-8 h-8" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-900 truncate">
                          {category.displayName}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {category.itemCount} listings
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
