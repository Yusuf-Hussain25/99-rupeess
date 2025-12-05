'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  distance?: number;
  link: string;
}

interface MobileBusinessListProps {
  businesses: Business[];
}

export default function MobileBusinessList({ businesses }: MobileBusinessListProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex gap-4" style={{ width: 'max-content' }}>
        {businesses.map((business) => {
          const distance = business.distance || 0;
          const time = Math.round(distance * 1.5);

          return (
            <Link
              key={business.id}
              href={business.link}
              className="shrink-0 w-[280px] sm:w-[320px] block"
            >
              <div className="relative h-[200px] sm:h-[220px] rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
                <Image
                  src={business.imageUrl}
                  alt={business.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Top</span>
                </div>

                {/* Distance and Time */}
                <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-md">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{distance.toFixed(1)}km</span>
                    <Clock className="w-3.5 h-3.5 text-amber-600 ml-1" />
                    <span>{time}min</span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold text-base">{business.rating.toFixed(1)}</span>
                    <span className="text-white/80 text-sm">({business.reviews})</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{business.name}</h3>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}







