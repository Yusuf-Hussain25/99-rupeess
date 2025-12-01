/**
 * Example Implementation: Enhanced CategoryGrid with Search & Sorting
 * 
 * This shows how to add search and sorting functionality to CategoryGrid
 * Copy relevant parts to your CategoryGrid.tsx
 */

'use client';

import { useState, useMemo } from 'react';
import type { Category } from '../types';

// Add these state variables to CategoryGrid component
export function EnhancedCategoryGridExample() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'recent'>('name');
  const [showEmptyCategories, setShowEmptyCategories] = useState(false);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const hasItems = category.itemCount > 0;
      
      return matchesSearch && (showEmptyCategories || hasItems);
    });
  }, [categories, searchQuery, showEmptyCategories]);

  // Sort categories
  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          // Sort by business count (most popular first)
          return b.itemCount - a.itemCount;
        case 'recent':
          // If you have createdAt field, sort by date
          // return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return 0; // Placeholder
        case 'name':
        default:
          return a.displayName.localeCompare(b.displayName);
      }
    });
  }, [filteredCategories, sortBy]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'popular' | 'recent')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        >
          <option value="name">Sort by Name</option>
          <option value="popular">Sort by Popularity</option>
          <option value="recent">Sort by Recent</option>
        </select>

        {/* Toggle Empty Categories */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showEmptyCategories}
            onChange={(e) => setShowEmptyCategories(e.target.checked)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">Show empty categories</span>
        </label>
      </div>

      {/* Search Results Count */}
      {searchQuery && (
        <div className="text-sm text-gray-600">
          Found {sortedCategories.length} category{sortedCategories.length !== 1 ? 'ies' : ''} matching "{searchQuery}"
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Empty State */}
      {sortedCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No categories found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-amber-600 hover:text-amber-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced Category Card with Badges
function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="group relative bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer">
      {/* Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {category.sponsored && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
            Sponsored
          </span>
        )}
        {category.itemCount > 50 && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* Category Icon/Image */}
      <div className="mb-3">
        {/* Your existing category icon/image */}
      </div>

      {/* Category Name */}
      <h3 className="font-semibold text-gray-900 mb-1">{category.displayName}</h3>

      {/* Business Count */}
      <p className="text-sm text-gray-500">
        {category.itemCount} {category.itemCount === 1 ? 'business' : 'businesses'}
      </p>
    </div>
  );
}

/**
 * Additional Features You Can Add:
 * 
 * 1. Category Filters:
 *    - Filter by business count range
 *    - Filter by sponsored status
 *    - Filter by category type
 * 
 * 2. Category Statistics:
 *    - Show average rating
 *    - Show new businesses this month
 *    - Show growth percentage
 * 
 * 3. Category Actions:
 *    - "View All" button
 *    - "Add Business" quick link
 *    - Share category
 *    - Save favorite categories
 * 
 * 4. Category Recommendations:
 *    - "You might also like"
 *    - "Popular in your area"
 *    - "Similar categories"
 */

