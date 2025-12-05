'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getBannerDistance } from '../../utils/shopDistance';

interface HeroBannerData {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  title?: string;
  ctaText?: string;
  advertiser?: string;
  lat?: number;
  lng?: number;
  isBusiness?: boolean;
}

interface HeroBannerProps {
  hero?: HeroBannerData;
  onBannerClick: (bannerId: string, section: 'hero', position: number, link: string) => void;
  height?: string;
  userLat?: number | null;
  userLng?: number | null;
}

export default function HeroBanner({ hero, onBannerClick, height = 'h-[480px]', userLat, userLng }: HeroBannerProps) {
  if (!hero) {
    return (
      <div className={`w-full ${height} bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300`}>
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 font-medium mb-2">No hero banner</p>
        <button
          onClick={() => window.location.href = '/advertise'}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Advertise Here
        </button>
      </div>
    );
  }

  const ctaLabel = hero.title || hero.advertiser || 'View offer';
  const [distance, setDistance] = useState<number | null>(null);

  // Calculate distance
  useEffect(() => {
    if (!hero) {
      setDistance(null);
      return;
    }
    
    getBannerDistance(hero, userLat ?? null, userLng ?? null)
      .then(setDistance)
      .catch(() => setDistance(null));
  }, [hero, userLat, userLng]);

  return (
    <div className={`relative w-full ${height} rounded-xl overflow-hidden shadow-lg border border-gray-200 group`}>
      <button
        onClick={() => onBannerClick(hero.bannerId, 'hero', 0, hero.link)}
        className="absolute inset-0 z-10"
        aria-label={`Open hero banner: ${ctaLabel}`}
      >
        <span className="sr-only">{hero.ctaText || 'View Details'}</span>
      </button>
      <Image
        src={hero.imageUrl}
        alt={hero.alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        priority
        sizes="(max-width: 1024px) 100vw, 60vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Distance and Time Badge */}
      {(distance !== null && distance !== undefined) && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <div className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-white/50 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                {distance.toFixed(1)} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-gray-900">
                {Math.round(distance * 1.5)} min
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

