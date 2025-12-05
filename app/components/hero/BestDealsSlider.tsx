'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLocation } from '@/app/contexts/LocationContext';

interface BestDealsSliderProps {
  category?: string;
}

const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

// Fallback images if no location-specific images are found
const fallbackSliderImages = [
  { src: '/Assets/5092428.jpg', alt: 'Shopping Sale' },
  { src: '/Assets/6874380.jpg', alt: 'Shopping Center Big Sale' },
];

export default function BestDealsSlider({ category }: BestDealsSliderProps) {
  const { location } = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [sliderImages, setSliderImages] = useState<Array<{ src: string; alt: string }>>(fallbackSliderImages);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch slider images based on location
  useEffect(() => {
    const fetchSliderImages = async () => {
      // Wait for location to be available
      if (!location?.id) {
        setLoading(true);
        // Don't set fallback immediately - wait a bit for location to load
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/banners?section=slider&loc=${location.id}&limit=10`);
        const data = await res.json();
        
        if (data.banners && data.banners.length > 0) {
          const images = data.banners.map((banner: any) => ({
            src: banner.imageUrl,
            alt: banner.alt || banner.title || 'Best Deal',
          }));
          setSliderImages(images);
        } else {
          // Only use fallback if location is set but no banners found
          setSliderImages(fallbackSliderImages);
        }
      } catch (error) {
        console.error('Error fetching slider images:', error);
        // Only use fallback on error if we have a location
        if (location?.id) {
          setSliderImages(fallbackSliderImages);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSliderImages();
  }, [location?.id]);

  // Auto-slide functionality
  useEffect(() => {
    if (sliderImages.length <= 1 || isHovered || loading) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, sliderImages.length, loading]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        <div className="relative w-full h-32 sm:h-40 md:h-44 lg:h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }

  if (sliderImages.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Container - Mobile optimized */}
      <div className="relative w-full h-32 sm:h-40 md:h-44 lg:h-48">
        {/* Slider Images */}
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover object-center w-full"
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Navigation Arrows */}
        {sliderImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-1 sm:p-1.5 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-1 sm:p-1.5 rounded-full shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {sliderImages.length > 1 && (
          <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-1 sm:gap-1.5">
            {sliderImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-4 sm:w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

