'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { BusinessSummary } from '../types';

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/businesses/featured');
        const data = await res.json();
        setBusinesses(data.businesses || []);
      } catch (e) {
        console.error('Failed to load featured businesses', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8 px-2 sm:px-3 lg:px-4">
        <div className="max-w-[98%] mx-auto">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-56 bg-gray-200 animate-pulse" />
                <div className="p-5">
                  <div className="h-5 w-3/4 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-2 sm:px-3 lg:px-4">
      <div className="max-w-[98%] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Businesses</h2>
          <a href="/search?featured=1" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all →</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {businesses.map((biz) => (
            <article key={biz.id} className="rounded-2xl bg-white shadow-md border border-gray-200 overflow-hidden transition-transform hover:-translate-y-0.5">
              <div className="relative h-56">
                <Image src={biz.imageUrl} alt={biz.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                <span className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow">{biz.category}</span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{biz.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657A8 8 0 1117.657 16.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{biz.city}{biz.state ? `, ${biz.state}` : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span>{biz.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({biz.reviews})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a href={`/contact/${biz.id}`} className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.129a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.163 25 3 18.837 3 11V5z" /></svg>
                      Contact
                    </a>
                    <a href={`/business/${biz.id}`} className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
