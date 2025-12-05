'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sortBannersByDistance, getBannerDistance } from '../../utils/shopDistance';

interface BusinessBanner {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  advertiser?: string;
  lat?: number;
  lng?: number;
  distance?: number;
  isBusiness?: boolean;
  rating?: number;
  reviews?: number;
}

interface CategoryRightRailProps {
  banners: BusinessBanner[];
  onBannerClick: (bannerId: string, section: 'right', position: number, link: string) => void;
  height?: string;
  userLat?: number | null;
  userLng?: number | null;
}

const FADE_DURATION = 600;
const ROTATION_INTERVAL = 9000;

// Separate component for banner item with async distance calculation
function BannerItem({ 
  banner, 
  index, 
  userLat, 
  userLng, 
  onBannerClick 
}: { 
  banner: BusinessBanner; 
  index: number; 
  userLat?: number | null; 
  userLng?: number | null; 
  onBannerClick: (bannerId: string, section: 'right', position: number, link: string) => void;
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
      className="relative group flex-1 min-h-[100px] rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={() => onBannerClick(banner.bannerId, 'right', index, banner.link)}
    >
      <div className="relative h-full w-full">
        <Image
          src={banner.imageUrl}
          alt={banner.alt}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          sizes="(max-width: 1024px) 18vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        
        {/* Rating Badge - Top Right */}
        {banner.rating && banner.rating >= 4.5 && (
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-amber-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1">
              <span>★</span>
              <span>Top</span>
            </div>
          </div>
        )}
        
        {/* Business Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="text-white font-bold text-xs sm:text-sm mb-2 line-clamp-1 drop-shadow-lg">
            {banner.advertiser || banner.alt}
          </h3>
          
          {/* Rating and Reviews */}
          {(banner.rating || banner.reviews) && (
            <div className="flex items-center gap-2 mb-2">
              {banner.rating && (
                <div className="flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 py-0.5 rounded-md">
                  <span className="text-yellow-400 text-xs">★</span>
                  <span className="text-white text-xs font-bold">{banner.rating.toFixed(1)}</span>
                </div>
              )}
              {banner.reviews && (
                <span className="text-white/90 text-[10px] sm:text-xs font-medium">
                  {banner.reviews}
                </span>
              )}
            </div>
          )}
          
          {/* Distance Badge */}
          {(distance !== null || banner.distance) && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md w-fit">
              <svg className="w-3 h-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-[10px] sm:text-xs font-bold">
                {((distance ?? banner.distance) || 0).toFixed(1)} km
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryRightRail({ banners, onBannerClick, height = 'h-[480px]', userLat, userLng }: CategoryRightRailProps) {
  const [sortedBanners, setSortedBanners] = useState<BusinessBanner[]>(banners);

  useEffect(() => {
    if (userLat !== null && userLat !== undefined && userLng !== null && userLng !== undefined) {
      sortBannersByDistance(banners, userLat, userLng)
        .then(sorted => setSortedBanners(sorted.map(item => item.banner)))
        .catch(() => setSortedBanners(banners));
    } else {
      setSortedBanners(banners);
    }
  }, [banners, userLat, userLng]);

  const chunkBanners = (source: BusinessBanner[]) => {
    const chunks: BusinessBanner[][] = [];
    for (let i = 0; i < source.length; i += 4) {
      chunks.push(source.slice(i, i + 4));
    }
    return chunks;
  };

  const bannerSets = useMemo(() => {
    const dynamicSets = chunkBanners(sortedBanners);
    return dynamicSets.length > 0 ? dynamicSets : [sortedBanners.slice(0, 4)];
  }, [sortedBanners]);

  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (bannerSets.length <= 1) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isHovered) return;

    intervalRef.current = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveSetIndex((prev) => (prev + 1) % bannerSets.length);
        setIsFading(false);
      }, FADE_DURATION);
    }, ROTATION_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bannerSets.length, isHovered]);

  useEffect(() => {
    setActiveSetIndex(0);
  }, [bannerSets.length]);

  const currentBanners = bannerSets[activeSetIndex] || [];

  return (
    <div 
      className={`flex flex-col gap-3 sm:gap-4 ${height} overflow-hidden`} 
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`h-full flex flex-col gap-3 sm:gap-4 transition-opacity ${isFading ? 'opacity-0' : 'opacity-100'}`}
        style={{ transitionDuration: `${FADE_DURATION}ms` }}
      >
        {[0, 1, 2, 3].map((index) => {
          const banner = currentBanners[index];
          
          if (!banner) {
            return (
              <div key={`right-placeholder-${index}`} className="flex-1 min-h-[100px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300" />
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

