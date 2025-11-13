'use client';

import Image from 'next/image';

interface Banner {
  bannerId: string;
  imageUrl: string;
  alt: string;
  link: string;
  advertiser?: string;
}

interface BottomStripProps {
  banners: Banner[];
  onBannerClick: (bannerId: string, section: 'bottom', position: number, link: string) => void;
}

export default function BottomStrip({ banners, onBannerClick }: BottomStripProps) {
  const renderPlaceholder = (position: number) => (
    <div
      onClick={() => window.location.href = '/advertise'}
      className="inline-flex items-center justify-center h-16 md:h-20 px-4 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer min-w-[100px]"
      role="button"
      tabIndex={0}
      aria-label={`Advertise here - Bottom position ${position + 1}`}
    >
      <span className="text-xs font-medium text-gray-500">Ad</span>
    </div>
  );

  // Split banners into 2 rows of 10 each
  const row1 = banners.slice(0, 10);
  const row2 = banners.slice(10, 20);

  return (
    <div className="w-full mt-6">
      {/* Desktop: 2 Rows of 10 images each */}
      <div className="hidden md:block">
        {/* Row 1: 10 images */}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {[...Array(10)].map((_, index) => {
            const banner = row1[index];
            return banner ? (
              <button
                key={banner.bannerId}
                onClick={() => onBannerClick(banner.bannerId, 'bottom', index, banner.link)}
                className="inline-flex items-center justify-center h-16 md:h-18 px-3 rounded-md border border-gray-200 bg-white shadow-sm hover:scale-105 hover:shadow-md hover:border-blue-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[100px] flex-1 max-w-[120px]"
                aria-label={`Banner: ${banner.advertiser || 'Advertisement'} - Bottom slot ${index + 1}`}
                data-banner-id={banner.bannerId}
                data-section="bottom"
                data-position={index}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.alt}
                  width={70}
                  height={56}
                  className="object-contain max-h-full max-w-full"
                  loading="lazy"
                />
              </button>
            ) : (
              <div key={`bottom-placeholder-${index}`} className="flex-1 max-w-[120px]">
                {renderPlaceholder(index)}
              </div>
            );
          })}
        </div>
        {/* Row 2: 10 images */}
        <div className="flex flex-wrap justify-center gap-2">
          {[...Array(10)].map((_, index) => {
            const banner = row2[index];
            const actualIndex = index + 10;
            return banner ? (
              <button
                key={banner.bannerId}
                onClick={() => onBannerClick(banner.bannerId, 'bottom', actualIndex, banner.link)}
                className="inline-flex items-center justify-center h-16 md:h-18 px-3 rounded-md border border-gray-200 bg-white shadow-sm hover:scale-105 hover:shadow-md hover:border-blue-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[100px] flex-1 max-w-[120px]"
                aria-label={`Banner: ${banner.advertiser || 'Advertisement'} - Bottom slot ${actualIndex + 1}`}
                data-banner-id={banner.bannerId}
                data-section="bottom"
                data-position={actualIndex}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.alt}
                  width={70}
                  height={56}
                  className="object-contain max-h-full max-w-full"
                  loading="lazy"
                />
              </button>
            ) : (
              <div key={`bottom-placeholder-${actualIndex}`} className="flex-1 max-w-[120px]">
                {renderPlaceholder(actualIndex)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: Horizontal Swiper */}
      <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {[...Array(20)].map((_, index) => {
            const banner = banners[index];
            return banner ? (
              <button
                key={banner.bannerId}
                onClick={() => onBannerClick(banner.bannerId, 'bottom', index, banner.link)}
                className="shrink-0 inline-flex items-center justify-center h-20 w-20 rounded-md border border-gray-200 bg-white shadow-sm hover:scale-105 hover:shadow-md transition-all duration-150 snap-start min-w-[80px] min-h-[80px]"
                aria-label={`Banner: ${banner.advertiser || 'Advertisement'} - Bottom slot ${index + 1}`}
                data-banner-id={banner.bannerId}
                data-section="bottom"
                data-position={index}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.alt}
                  width={60}
                  height={60}
                  className="object-contain max-h-full max-w-full"
                  loading="lazy"
                />
              </button>
            ) : (
              <div
                key={`bottom-placeholder-${index}`}
                onClick={() => window.location.href = '/advertise'}
                className="shrink-0 inline-flex items-center justify-center h-20 w-20 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer snap-start min-w-[80px] min-h-[80px]"
                role="button"
                tabIndex={0}
                aria-label={`Advertise here - Bottom position ${index + 1}`}
              >
                <span className="text-xs font-medium text-gray-500">Ad</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
