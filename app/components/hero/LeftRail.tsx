'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { sortBannersByDistance, getBannerDistance } from '../../utils/shopDistance';

interface Banner {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  advertiser?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  isBusiness?: boolean;
}

interface LeftRailProps {
  banners: Banner[];
  onBannerClick: (bannerId: string, section: 'left', position: number, link: string) => void;
  height?: string; // To match center height
  userLat?: number | null;
  userLng?: number | null;
}

const encodeAssetPath = (path: string) =>
  encodeURI(path).replace(/#/g, '%23');

const createBanner = (id: string, fileName: string, alt: string): Banner => ({
  bannerId: id,
  imageUrl: encodeAssetPath(`/Assets/${fileName}`),
  alt,
  link: '#',
});

const fallbackSetA: Banner[] = [
  createBanner('left-asset-swiggy', 'Swiggy-logo.jpg', 'Swiggy'),
  createBanner('left-asset-ola', 'Ola-Cabs-Logo-2048x1153.jpg', 'Ola'),
  createBanner('left-asset-nykaa', 'Nykaa_New_Logo.svg', 'Nykaa'),
  createBanner('left-asset-tata', 'Tata_logo.svg.png', 'Tata'),
];

const fallbackSetB: Banner[] = [
  createBanner('left-asset-reliance', 'Reliance-Industries-Limited-Logo.png', 'Reliance'),
  createBanner('left-asset-amul', 'Amul-Logo.png', 'Amul'),
  createBanner('left-asset-infosys', 'Infosys-Logo.jpg', 'Infosys'),
  createBanner('left-asset-lic', 'LIC-Logo.png', 'LIC'),
];


// Separate component for banner item with async distance calculation
function BannerItem({ 
  banner, 
  index, 
  userLat, 
  userLng, 
  onBannerClick 
}: { 
  banner: Banner; 
  index: number; 
  userLat?: number | null; 
  userLng?: number | null; 
  onBannerClick: (bannerId: string, section: 'left', position: number, link: string) => void;
}) {
  const [distance, setDistance] = useState<number | null>(null);
  
  useEffect(() => {
    if (banner && userLat !== null && userLat !== undefined && userLng !== null && userLng !== undefined) {
      getBannerDistance(banner, userLat, userLng)
        .then(setDistance)
        .catch(() => setDistance(null));
    } else {
      setDistance(null);
    }
  }, [banner, userLat, userLng]);


  return (
    <div
      key={banner.bannerId}
      className="relative group w-full flex-1 min-h-0"
    >
      <button
        onClick={() => onBannerClick(banner.bannerId, 'left', index, banner.link)}
        className="relative w-full h-full rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={`Banner: ${banner.advertiser || 'Advertisement'} - Left slot ${index + 1}`}
        data-banner-id={banner.bannerId}
        data-section="left"
        data-position={index}
      >
        <Image
          src={banner.imageUrl}
          alt={banner.alt}
          fill
          className={`${banner.isBusiness ? 'object-cover' : 'object-contain'} p-2 sm:p-3`}
          loading="lazy"
          sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 20vw"
        />
        {/* Gradient overlay for businesses */}
        {banner.isBusiness && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        )}
      </button>
      {/* Distance and Call Button Overlay */}
      {distance !== null && distance !== undefined && (
        <>
          {/* Mobile: Always visible distance and time badge - Optimized */}
          <div className="absolute top-0.5 right-0.5 sm:hidden z-10">
            <div className="bg-blue-600 text-white px-1 py-0.5 rounded text-[9px] font-bold shadow-md flex flex-col items-center gap-0 leading-tight">
              <div className="flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{distance.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-0.5">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{Math.round(distance * 1.5)} min</span>
              </div>
            </div>
          </div>
          {/* Desktop: Distance badge */}
          <div className="absolute top-2 right-2 hidden sm:block z-10">
            <div className="bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg shadow-lg border border-white/50 flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold text-gray-900">{distance.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-gray-900">{Math.round(distance * 1.5)} min</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function LeftRail({ banners, onBannerClick, height = 'h-[480px]', userLat, userLng }: LeftRailProps) {
  const [sortedBanners, setSortedBanners] = useState<Banner[]>(banners);

  // Sort banners by distance if user location is available
  useEffect(() => {
    if (userLat !== null && userLat !== undefined && userLng !== null && userLng !== undefined) {
      sortBannersByDistance(banners, userLat, userLng)
        .then(sorted => setSortedBanners(sorted.map(item => item.banner)))
        .catch(() => setSortedBanners(banners));
    } else {
      setSortedBanners(banners);
    }
  }, [banners, userLat, userLng]);

  // Show only first 4 banners, or fallback if no banners
  const currentBanners = useMemo(() => {
    if (sortedBanners.length === 0) {
      return fallbackSetA;
    }
    return sortedBanners.slice(0, 4);
  }, [sortedBanners]);

  const renderPlaceholder = (position: number) => (
    <div
      className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
      onClick={() => window.location.href = '/advertise'}
      role="button"
      tabIndex={0}
      aria-label={`Advertise here - Left position ${position + 1}`}
    >
      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-0.5 sm:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-[10px] sm:text-xs font-medium text-gray-600">Advertise</span>
    </div>
  );

  return (
    <div 
      className={`flex flex-col gap-2 sm:gap-3 ${height} overflow-hidden`} 
      aria-live="polite"
    >
      <div className="h-full flex flex-col gap-2 sm:gap-3">
        {[0, 1, 2, 3].map((index) => {
          const banner = currentBanners[index];
          
          if (!banner) {
            return (
              <div
                key={`left-placeholder-${index}`}
                className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => window.location.href = '/advertise'}
                role="button"
                tabIndex={0}
                aria-label={`Advertise here - Left position ${index + 1}`}
              >
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-0.5 sm:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] sm:text-xs font-medium text-gray-600">Advertise</span>
              </div>
            );
          }
          
          return (
            <BannerItem
              key={banner.bannerId}
              banner={banner}
              index={index}
              userLat={userLat}
              userLng={userLng}
              onBannerClick={onBannerClick}
            />
          );
        })}
      </div>
    </div>
  );
}
