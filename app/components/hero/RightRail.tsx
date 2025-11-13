'use client';

import Image from 'next/image';

interface Banner {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  advertiser?: string;
}

interface RightRailProps {
  banners: Banner[];
  onBannerClick: (bannerId: string, section: 'right', position: number, link: string) => void;
  height?: string; // To match center height
}

export default function RightRail({ banners, onBannerClick, height = 'h-[480px]' }: RightRailProps) {
  const renderPlaceholder = (position: number) => (
    <div
      className="w-full flex-1 min-h-[100px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
      onClick={() => window.location.href = '/advertise'}
      role="button"
      tabIndex={0}
      aria-label={`Advertise here - Right position ${position + 1}`}
    >
      <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-xs font-medium text-gray-600">Advertise</span>
    </div>
  );

  return (
    <div className={`flex flex-col gap-2 ${height} overflow-hidden items-end`}>
      {[0, 1, 2, 3].map((index) => {
        const banner = banners[index];
        return banner ? (
          <button
            key={banner.bannerId}
            onClick={() => onBannerClick(banner.bannerId, 'right', index, banner.link)}
            className="relative w-full flex-1 min-h-[100px] rounded-lg bg-white shadow-sm overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Banner: ${banner.advertiser || 'Advertisement'} - Right slot ${index + 1}`}
            data-banner-id={banner.bannerId}
            data-section="right"
            data-position={index}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.alt}
              fill
              className="object-contain p-2"
              loading="lazy"
              sizes="(max-width: 1024px) 0vw, 20vw"
            />
          </button>
        ) : (
          <div key={`right-placeholder-${index}`} className="w-full">
            {renderPlaceholder(index)}
          </div>
        );
      })}
    </div>
  );
}
