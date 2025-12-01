'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface BusinessBanner {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  advertiser?: string;
  distance?: number;
  isBusiness?: boolean;
  rating?: number;
  reviews?: number;
}

interface CategoryBottomStripProps {
  banners: BusinessBanner[];
  onBannerClick: (
    bannerId: string,
    section: 'bottom',
    position: number,
    link: string
  ) => void;
}

const SCROLL_INTERVAL = 3000;
const SCROLL_SPEED = 1;

export default function CategoryBottomStrip({ banners, onBannerClick }: CategoryBottomStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const displayBanners = useMemo(() => {
    if (banners.length === 0) return [];
    // Show up to 20 businesses
    return banners.slice(0, 20);
  }, [banners]);

  useEffect(() => {
    if (displayBanners.length === 0 || isHovered) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    scrollIntervalRef.current = setInterval(() => {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        // Reset to start
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: SCROLL_SPEED * 50, behavior: 'smooth' });
      }
    }, SCROLL_INTERVAL);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [displayBanners.length, isHovered]);

  if (displayBanners.length === 0) {
    return null;
  }

  return (
    <div 
      className="w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onScroll={(e) => {
          // Pause auto-scroll if user manually scrolls
          const target = e.currentTarget;
          if (target.scrollLeft > 0) {
            setIsHovered(true);
            setTimeout(() => setIsHovered(false), 5000);
          }
        }}
      >
        {displayBanners.map((banner, index) => (
          <div
            key={banner.bannerId}
            className="relative flex-shrink-0 w-32 sm:w-40 md:w-48 h-24 sm:h-28 md:h-32 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            onClick={() => onBannerClick(banner.bannerId, 'bottom', index, banner.link)}
          >
            <div className="relative h-full w-full">
              <Image
                src={banner.imageUrl}
                alt={banner.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
              
              {/* Rating Badge - Top Left */}
              {banner.rating && banner.rating >= 4.5 && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-amber-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-bold shadow-lg">
                    ★ Top
                  </div>
                </div>
              )}
              
              {/* Distance Badge - Top Right */}
              {(banner.distance !== undefined) && (
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                  <div className="bg-blue-600/95 backdrop-blur-sm text-white px-2 py-1 rounded-lg shadow-xl border border-blue-400/30 flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] font-bold leading-tight">
                        {banner.distance.toFixed(1)}km
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[8px] sm:text-[9px] font-semibold leading-tight">
                        {Math.round(banner.distance * 1.5)}min
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Business Name - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <h3 className="text-white text-[10px] sm:text-xs font-bold line-clamp-1 mb-1.5 drop-shadow-lg">
                  {banner.advertiser || banner.alt}
                </h3>
                {/* Rating */}
                {banner.rating && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md w-fit">
                    <span className="text-yellow-400 text-[9px] sm:text-[10px]">★</span>
                    <span className="text-white text-[9px] sm:text-[10px] font-bold">{banner.rating.toFixed(1)}</span>
                    {banner.reviews && (
                      <span className="text-white/80 text-[8px] sm:text-[9px] ml-1">
                        ({banner.reviews})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

