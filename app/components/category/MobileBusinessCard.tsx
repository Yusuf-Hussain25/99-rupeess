'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';

interface MobileBusinessCardProps {
  business: {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    reviews: number;
    distance?: number;
    isFeatured?: boolean;
    link: string;
  };
  isLarge?: boolean;
}

export default function MobileBusinessCard({ business, isLarge = false }: MobileBusinessCardProps) {
  const distance = business.distance || 0;
  const time = Math.round(distance * 1.5);

  if (isLarge) {
    // Large Featured Card (Center)
    return (
      <Link href={business.link} className="block">
        <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden shadow-xl border-2 border-amber-400">
          <Image
            src={business.imageUrl}
            alt={business.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Featured Badge */}
          {business.isFeatured && (
            <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              <span>Fea</span>
            </div>
          )}

          {/* Distance and Time Badge */}
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-gray-900">{distance.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-gray-900">{time} min</span>
              </div>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold text-lg">{business.rating.toFixed(1)}</span>
              <span className="text-white/80 text-sm">({business.reviews})</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-3">{business.name}</h3>
            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg">
              <span>View Details</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Small Card (Left/Right columns)
  return (
    <Link href={business.link} className="block">
      <div className="relative w-full h-[140px] sm:h-[160px] rounded-xl overflow-hidden shadow-md border border-gray-200 bg-gray-800">
        <Image
          src={business.imageUrl}
          alt={business.name}
          fill
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          <span>{business.rating.toFixed(1)}</span>
        </div>

        {/* Distance Badge */}
        <div className="absolute top-2 right-2 z-10 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{distance.toFixed(1)} km</span>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h4 className="text-white font-semibold text-sm truncate">{business.name}</h4>
        </div>
      </div>
    </Link>
  );
}

