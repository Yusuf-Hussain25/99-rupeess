'use client';

import Image from 'next/image';

interface HeroBannerData {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  title?: string;
  ctaText?: string;
  advertiser?: string;
}

interface HeroBannerProps {
  hero?: HeroBannerData;
  onBannerClick: (bannerId: string, section: 'hero', position: number, link: string) => void;
  height?: string;
}

export default function HeroBanner({ hero, onBannerClick, height = 'h-[480px]' }: HeroBannerProps) {
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
    </div>
  );
}

