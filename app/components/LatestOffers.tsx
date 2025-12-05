'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Offer } from '../types';
import { useLocation } from '../contexts/LocationContext';

export default function LatestOffers() {
  const { location } = useLocation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bannerImages, setBannerImages] = useState<Array<{ 
    imageUrl: string; 
    link: string; 
    alt: string;
    name?: string;
    offer?: string;
    rating?: number;
    reviews?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Wait for location to be available
      if (!location?.id) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch location-specific banner images first
        const bannersRes = await fetch(`/api/banners?section=latest-offers&loc=${location.id}&limit=10`);
        const bannersData = await bannersRes.json();
        
        if (bannersData.banners && bannersData.banners.length > 0) {
          // Use banner images if available with business data
          setBannerImages(bannersData.banners.map((b: any) => ({
            imageUrl: b.imageUrl,
            link: b.linkUrl || b.link || '#',
            alt: b.alt || b.title || 'Offer',
            name: b.advertiser || b.title || 'Offer',
            offer: b.ctaText || b.title || '',
            rating: b.rating !== undefined ? b.rating : 4.5,
            reviews: b.reviews !== undefined ? b.reviews : 10,
          })));
          setOffers([]); // Clear offers when using banners
        } else {
          // Only show empty if location is set but no banners found
          // Don't fallback to default offers API to avoid showing wrong images
          setBannerImages([]);
          setOffers([]);
        }
      } catch (e) {
        console.error('Failed to load latest offers', e);
        setBannerImages([]);
        setOffers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location?.id]);

  const formatTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (isLoading) {
    return (
      <section className="py-10 px-2 sm:px-3 lg:px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-[98%] mx-auto">
          <div className="h-8 w-56 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                <div className="h-60 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 w-3/4 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-3 animate-pulse" />
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 sm:py-12 px-2 sm:px-3 lg:px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[98%] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Latest Offers Patna</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Don't miss out on exclusive deals and discounts</p>
          </div>
          <a href="/search?offers=1" className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto group">
            <span>View all</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {bannerImages.length > 0 ? (
            bannerImages.map((banner, index) => {
              const distance = (2 + Math.random() * 5).toFixed(1);
              const locations = ['Rajendra Nagar', 'Kankarbagh', 'Boring Road', 'Gandhi Maidan', 'Exhibition Road', 'Patliputra Road'];
              const area = locations[index % locations.length];
              
              return (
                <article 
                  key={index} 
                  onClick={() => window.location.href = banner.link}
                  className="group rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-300 cursor-pointer"
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <Image 
                      src={banner.imageUrl} 
                      alt={banner.alt} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" 
                    />
                    {banner.offer && (
                      <span className="absolute top-2 right-2 z-20 inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-md">
                        {banner.offer}
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    {banner.rating !== undefined && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-yellow-500 text-sm font-semibold">★</span>
                        <span className="text-sm font-semibold text-gray-900">{banner.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                      {banner.name || banner.alt}
                    </h3>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{distance}km, {area}</span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            offers.map((offer, index) => {
            const distance = (2 + Math.random() * 5).toFixed(1);
            const locations = ['Rajendra Nagar', 'Kankarbagh', 'Boring Road', 'Gandhi Maidan', 'Exhibition Road', 'Patliputra Road'];
            const area = locations[index % locations.length];
            const rating = (3.5 + Math.random() * 1.5).toFixed(1);
            
            return (
              <article key={offer.id} className="group rounded-xl bg-white shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-orange-300 cursor-pointer">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  {offer.imageUrl ? (
                    <Image 
                      src={offer.imageUrl} 
                      alt={offer.headline} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" 
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-3xl font-bold">{offer.shopName.charAt(0)}</span>
                    </div>
                  )}
                  {offer.discount && (
                    <span className="absolute top-2 right-2 z-20 inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white shadow-md">
                      {offer.discount}
                    </span>
                  )}
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <span className="text-yellow-500 text-sm font-semibold">★</span>
                    <span className="text-sm font-semibold text-gray-900">{rating}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
                    {offer.headline}
                  </h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{distance}km, {area}</span>
                  </div>
                </div>
              </article>
            );
          })
          )}
        </div>
      </div>
    </section>
  );
}

