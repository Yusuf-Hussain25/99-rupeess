'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import LocationSelector from './LocationSelector';
import { useLocation } from '../contexts/LocationContext';
import type { SearchSuggestion } from '../types';

export default function Navbar() {
  const { location: currentLocation, setLocation: setCurrentLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      const clearSuggestions = () => {
        setSuggestions([]);
        setShowSuggestions(false);
      };
      clearSuggestions();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}&loc=${currentLocation.id}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, currentLocation.id]);

  const handleSubmit = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(finalQuery)}&loc=${currentLocation.id}`);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSubmit(suggestions[selectedIndex].title);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSubmit(suggestion.title);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md border-b-2 border-blue-50">
      <div className="max-w-[98%] mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex items-center justify-between h-18 md:h-20 gap-4 py-2">
          {/* Left: Logo with enhanced design */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl px-3 py-2 shadow-lg">
                  <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    <span className="text-blue-100">99</span>
                    <span className="text-orange-400">rupeess</span>
                  </span>
                </div>
              </div>
              <div className="hidden lg:block ml-3">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Business Directory</div>
                <div className="text-xs text-gray-500">Find & Connect Locally</div>
              </div>
            </Link>
          </div>

          {/* Center: Location + Search with enhanced design */}
          <div className="flex-1 max-w-4xl mx-4 hidden md:flex items-center gap-3">
            {/* Location Input - Enhanced */}
            <LocationSelector 
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
            />

            {/* Search Input - Enhanced with gradient focus */}
            <div className={`relative flex-1 transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`} role="search">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-orange-500/20 rounded-xl blur-md transition-opacity ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelectedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      setIsSearchFocused(true);
                      if (query.length >= 2) setShowSuggestions(true);
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search businesses, services, products..."
                    className="w-full h-12 pl-4 pr-24 py-3 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-white shadow-sm transition-all"
                    aria-label="Search businesses, services or categories"
                  />
                  {/* Voice Search Icon - Enhanced */}
                  <button
                    type="button"
                    className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
                    aria-label="Voice search"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1h2v1a5 5 0 0 0 10 0v-1h2z"/>
                      <path d="M12 18v4h-2v2h6v-2h-2v-4h-2z"/>
                    </svg>
                  </button>
                  {/* Search Button - Enhanced with gradient */}
                  <button
                    onClick={() => handleSubmit()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    aria-label="Search"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Enhanced Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-3 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto backdrop-blur-sm"
                >
                  <div className="p-2">
                    {suggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full px-4 py-3 text-left rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 focus:bg-gradient-to-r focus:from-blue-50 focus:to-orange-50 focus:outline-none transition-all ${
                          index === selectedIndex ? 'bg-gradient-to-r from-blue-50 to-orange-50 ring-2 ring-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                            suggestion.type === 'shop' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700' :
                            suggestion.type === 'category' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700' :
                            'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700'
                          }`}>
                            {suggestion.type === 'shop' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            ) : suggestion.type === 'category' ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {suggestion.title}
                            </div>
                            {suggestion.subtitle && (
                              <div className="text-xs text-gray-500 truncate mt-0.5">
                                {suggestion.subtitle}
                              </div>
                            )}
                          </div>
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Search + Location (stacked) */}
          <div className="flex-1 md:hidden mx-2">
            <div className="flex flex-col gap-2">
              <div className="relative" role="search">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-10 pl-3 pr-10 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  onClick={() => handleSubmit()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <LocationSelector 
                currentLocation={currentLocation}
                onLocationChange={setCurrentLocation}
              />
            </div>
          </div>

          {/* Right: Enhanced CTAs */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Premium Badge */}
            <div className="hidden xl:block">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                Premium
              </span>
            </div>

            {/* Desktop CTAs with enhanced design */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Messages/Leads */}
              <Link
                href="/messages"
                className="relative flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
              >
                <div className="relative">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full ring-2 ring-white"></span>
                </div>
                <span className="font-medium">Messages</span>
              </Link>

              {/* Promote Business */}
              <Link
                href="/promote"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span className="font-medium">Promote</span>
              </Link>

              {/* Add Listing */}
              <Link
                href="/add-listing"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all group"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">Add Listing</span>
              </Link>

              {/* Notifications */}
              <button
                className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full ring-2 ring-white"></span>
              </button>
            </div>

            {/* Login / Sign Up Button - Enhanced */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 shrink-0"
            >
              <svg className="w-4 h-4 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Login</span>
            </Link>

            {/* Mobile Menu */}
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
