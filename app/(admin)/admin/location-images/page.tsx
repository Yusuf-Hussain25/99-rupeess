'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Location {
  _id: string;
  id: string;
  displayName: string;
  area?: string;
  pincode?: number;
}

interface LocationImage {
  _id?: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
  order?: number;
  // Business data fields
  name?: string; // Business/shop name (uses advertiser field)
  rating?: number; // Rating (0-5)
  reviews?: number; // Number of reviews
  offer?: string; // Offer text (uses title or ctaText field)
  linkUrl?: string; // Link URL
}

export default function LocationImagesPage() {
  const { token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [pincodes, setPincodes] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchType, setSearchType] = useState<'area' | 'pincode'>('area');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPincode, setSelectedPincode] = useState<number | ''>('');

  // Image states for each section
  const [heroImage, setHeroImage] = useState<LocationImage>({ imageUrl: '', lat: undefined, lng: undefined });
  const [sliderImages, setSliderImages] = useState<LocationImage[]>([]);
  const [leftImages, setLeftImages] = useState<LocationImage[]>([
    { imageUrl: '', lat: undefined, lng: undefined, order: 0 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 1 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 2 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 3 },
  ]);
  const [rightImages, setRightImages] = useState<LocationImage[]>([
    { imageUrl: '', lat: undefined, lng: undefined, order: 0 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 1 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 2 },
    { imageUrl: '', lat: undefined, lng: undefined, order: 3 },
  ]);
  const [bottomImages, setBottomImages] = useState<LocationImage[]>([]);
  const [latestOffersImages, setLatestOffersImages] = useState<LocationImage[]>([]);
  const [featuredBusinessesImages, setFeaturedBusinessesImages] = useState<LocationImage[]>([]);
  const [topRatedBusinessesImages, setTopRatedBusinessesImages] = useState<LocationImage[]>([]);
  const [newBusinessesImages, setNewBusinessesImages] = useState<LocationImage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, [token]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/locations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
        // Extract unique pincodes
        const uniquePincodes = Array.from(
          new Set(data.locations?.map((loc: Location) => loc.pincode).filter(Boolean))
        ).sort((a, b) => (a as number) - (b as number)) as number[];
        setPincodes(uniquePincodes);
      }
    } catch (error) {
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };


  const handleLocationSelect = async (location: Location) => {
    setSelectedLocation(location);
    // Reset all image states
    setHeroImage({ imageUrl: '', lat: undefined, lng: undefined });
    setSliderImages([]);
    setLeftImages([
      { imageUrl: '', lat: undefined, lng: undefined, order: 0 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 1 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 2 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 3 },
    ]);
    setRightImages([
      { imageUrl: '', lat: undefined, lng: undefined, order: 0 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 1 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 2 },
      { imageUrl: '', lat: undefined, lng: undefined, order: 3 },
    ]);
    setBottomImages([]);
    // Fetch existing banners for this location
    try {
      const res = await fetch(`/api/admin/banners?locationId=${location.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const banners = data.banners || [];
        
        // Separate by section
        const hero = banners.find((b: any) => b.section === 'hero');
        const slider = banners.filter((b: any) => b.section === 'slider').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const left = banners.filter((b: any) => b.section === 'left').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const right = banners.filter((b: any) => b.section === 'right').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const bottom = banners.filter((b: any) => b.section === 'top' || b.section === 'bottom').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const latestOffers = banners.filter((b: any) => b.section === 'latest-offers').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const featuredBusinesses = banners.filter((b: any) => b.section === 'featured-businesses').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const topRatedBusinesses = banners.filter((b: any) => b.section === 'top-rated-businesses').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
        const newBusinesses = banners.filter((b: any) => b.section === 'new-businesses').sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

        if (hero) {
          setHeroImage({
            _id: hero._id,
            imageUrl: hero.imageUrl,
            lat: hero.lat,
            lng: hero.lng,
          });
        }

        // Set slider images
        const sliderImagesData = slider.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
        }));
        setSliderImages(sliderImagesData);

        // Fill left images (up to 4)
        const leftArray = [...leftImages];
        left.forEach((banner: any, index: number) => {
          if (index < 4) {
            leftArray[index] = {
              _id: banner._id,
              imageUrl: banner.imageUrl,
              lat: banner.lat,
              lng: banner.lng,
              order: index,
            };
          }
        });
        setLeftImages(leftArray);

        // Fill right images (up to 4)
        const rightArray = [...rightImages];
        right.forEach((banner: any, index: number) => {
          if (index < 4) {
            rightArray[index] = {
              _id: banner._id,
              imageUrl: banner.imageUrl,
              lat: banner.lat,
              lng: banner.lng,
              order: index,
            };
          }
        });
        setRightImages(rightArray);

        setBottomImages(bottom.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
        })));

        // Set new sections with business data
        setLatestOffersImages(latestOffers.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
          name: b.advertiser || b.title || '',
          offer: b.title || b.ctaText || '',
          rating: b.rating,
          reviews: b.reviews,
          linkUrl: b.linkUrl || '',
        })));

        setFeaturedBusinessesImages(featuredBusinesses.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
          name: b.advertiser || b.title || '',
          offer: b.title || b.ctaText || '',
          rating: b.rating,
          reviews: b.reviews,
          linkUrl: b.linkUrl || '',
        })));

        setTopRatedBusinessesImages(topRatedBusinesses.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
          name: b.advertiser || b.title || '',
          offer: b.title || b.ctaText || '',
          rating: b.rating,
          reviews: b.reviews,
          linkUrl: b.linkUrl || '',
        })));

        setNewBusinessesImages(newBusinesses.map((b: any) => ({
          _id: b._id,
          imageUrl: b.imageUrl,
          lat: b.lat,
          lng: b.lng,
          order: b.order || 0,
          name: b.advertiser || b.title || '',
          offer: b.title || b.ctaText || '',
          rating: b.rating,
          reviews: b.reviews,
          linkUrl: b.linkUrl || '',
        })));
      }
    } catch (error) {
      console.error('Error fetching location banners:', error);
    }
  };

  const handleImageUpload = async (section: 'hero' | 'slider' | 'left' | 'right' | 'bottom' | 'latest-offers' | 'featured-businesses' | 'top-rated-businesses' | 'new-businesses', index?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('section', section);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          toast.success('Image uploaded successfully');
          
          if (section === 'hero') {
            setHeroImage({ ...heroImage, imageUrl: data.url });
          } else if (section === 'slider') {
            if (index !== undefined) {
              const updated = [...sliderImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setSliderImages(updated);
            } else {
              setSliderImages([...sliderImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: sliderImages.length }]);
            }
          } else if (section === 'left' && index !== undefined) {
            const updated = [...leftImages];
            updated[index] = { ...updated[index], imageUrl: data.url };
            setLeftImages(updated);
          } else if (section === 'right' && index !== undefined) {
            const updated = [...rightImages];
            updated[index] = { ...updated[index], imageUrl: data.url };
            setRightImages(updated);
          } else if (section === 'bottom') {
            if (index !== undefined) {
              const updated = [...bottomImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setBottomImages(updated);
            } else {
              setBottomImages([...bottomImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: bottomImages.length }]);
            }
          } else if (section === 'latest-offers') {
            if (index !== undefined) {
              const updated = [...latestOffersImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setLatestOffersImages(updated);
            } else {
              setLatestOffersImages([...latestOffersImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: latestOffersImages.length }]);
            }
          } else if (section === 'featured-businesses') {
            if (index !== undefined) {
              const updated = [...featuredBusinessesImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setFeaturedBusinessesImages(updated);
            } else {
              setFeaturedBusinessesImages([...featuredBusinessesImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: featuredBusinessesImages.length }]);
            }
          } else if (section === 'top-rated-businesses') {
            if (index !== undefined) {
              const updated = [...topRatedBusinessesImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setTopRatedBusinessesImages(updated);
            } else {
              setTopRatedBusinessesImages([...topRatedBusinessesImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: topRatedBusinessesImages.length }]);
            }
          } else if (section === 'new-businesses') {
            if (index !== undefined) {
              const updated = [...newBusinessesImages];
              updated[index] = { ...updated[index], imageUrl: data.url };
              setNewBusinessesImages(updated);
            } else {
              setNewBusinessesImages([...newBusinessesImages, { imageUrl: data.url, lat: undefined, lng: undefined, order: newBusinessesImages.length }]);
            }
          }
        } else {
          toast.error(data.error || 'Upload failed');
        }
      } catch (error) {
        toast.error('Failed to upload image');
      }
    };
    input.click();
  };

  const handleSave = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location first');
      return;
    }

    setSaving(true);
    try {
      const bannersToSave: any[] = [];
      
      // Validate that we have at least one image to save
      const hasImages = heroImage.imageUrl || 
                       sliderImages.some(img => img.imageUrl) ||
                       leftImages.some(img => img.imageUrl) ||
                       rightImages.some(img => img.imageUrl) ||
                       bottomImages.some(img => img.imageUrl);
      
      if (!hasImages) {
        toast.error('Please add at least one image before saving');
        setSaving(false);
        return;
      }

      // Hero banner
      if (heroImage.imageUrl) {
        bannersToSave.push({
          section: 'hero',
          imageUrl: heroImage.imageUrl,
          linkUrl: '#',
          locationId: selectedLocation.id,
          area: selectedLocation.area || selectedLocation.displayName,
          pincode: selectedLocation.pincode,
          lat: heroImage.lat,
          lng: heroImage.lng,
          isActive: true,
          order: 0,
          _id: heroImage._id,
        });
      }

      // Slider images
      sliderImages.forEach((img, index) => {
        if (img.imageUrl) {
          const sliderBanner = {
            section: 'slider',
            imageUrl: img.imageUrl,
            linkUrl: '#',
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode ? parseInt(String(selectedLocation.pincode)) : undefined,
            lat: img.lat !== undefined && img.lat !== null ? parseFloat(String(img.lat)) : undefined,
            lng: img.lng !== undefined && img.lng !== null ? parseFloat(String(img.lng)) : undefined,
            isActive: true,
            order: img.order !== undefined && img.order !== null ? parseInt(String(img.order)) : index,
            _id: img._id,
          };
          bannersToSave.push(sliderBanner);
        }
      });

      // Left images
      leftImages.forEach((img, index) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'left',
            imageUrl: img.imageUrl,
            linkUrl: '#',
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode,
            lat: img.lat,
            lng: img.lng,
            isActive: true,
            order: index,
            _id: img._id,
          });
        }
      });

      // Right images
      rightImages.forEach((img, index) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'right',
            imageUrl: img.imageUrl,
            linkUrl: '#',
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode,
            lat: img.lat,
            lng: img.lng,
            isActive: true,
            order: index,
            _id: img._id,
          });
        }
      });

      // Bottom images
      bottomImages.forEach((img) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'top',
            imageUrl: img.imageUrl,
            linkUrl: '#',
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode,
            lat: img.lat,
            lng: img.lng,
            isActive: true,
            order: img.order || 0,
            _id: img._id,
          });
        }
      });

      // Latest Offers images
      latestOffersImages.forEach((img) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'latest-offers',
            imageUrl: img.imageUrl,
            linkUrl: img.linkUrl || '#',
            title: img.offer || img.name || '',
            advertiser: img.name || '',
            ctaText: img.offer || '',
            rating: img.rating !== undefined && img.rating !== null ? parseFloat(String(img.rating)) : undefined,
            reviews: img.reviews !== undefined && img.reviews !== null ? parseInt(String(img.reviews)) : undefined,
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode ? parseInt(String(selectedLocation.pincode)) : undefined,
            lat: img.lat !== undefined && img.lat !== null ? parseFloat(String(img.lat)) : undefined,
            lng: img.lng !== undefined && img.lng !== null ? parseFloat(String(img.lng)) : undefined,
            isActive: true,
            order: img.order !== undefined && img.order !== null ? parseInt(String(img.order)) : 0,
            _id: img._id,
          });
        }
      });

      // Featured Businesses images
      featuredBusinessesImages.forEach((img) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'featured-businesses',
            imageUrl: img.imageUrl,
            linkUrl: img.linkUrl || '#',
            title: img.offer || img.name || '',
            advertiser: img.name || '',
            ctaText: img.offer || '',
            rating: img.rating !== undefined && img.rating !== null ? parseFloat(String(img.rating)) : undefined,
            reviews: img.reviews !== undefined && img.reviews !== null ? parseInt(String(img.reviews)) : undefined,
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode ? parseInt(String(selectedLocation.pincode)) : undefined,
            lat: img.lat !== undefined && img.lat !== null ? parseFloat(String(img.lat)) : undefined,
            lng: img.lng !== undefined && img.lng !== null ? parseFloat(String(img.lng)) : undefined,
            isActive: true,
            order: img.order !== undefined && img.order !== null ? parseInt(String(img.order)) : 0,
            _id: img._id,
          });
        }
      });

      // Top Rated Businesses images
      topRatedBusinessesImages.forEach((img) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'top-rated-businesses',
            imageUrl: img.imageUrl,
            linkUrl: img.linkUrl || '#',
            title: img.offer || img.name || '',
            advertiser: img.name || '',
            ctaText: img.offer || '',
            rating: img.rating !== undefined && img.rating !== null ? parseFloat(String(img.rating)) : undefined,
            reviews: img.reviews !== undefined && img.reviews !== null ? parseInt(String(img.reviews)) : undefined,
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode ? parseInt(String(selectedLocation.pincode)) : undefined,
            lat: img.lat !== undefined && img.lat !== null ? parseFloat(String(img.lat)) : undefined,
            lng: img.lng !== undefined && img.lng !== null ? parseFloat(String(img.lng)) : undefined,
            isActive: true,
            order: img.order !== undefined && img.order !== null ? parseInt(String(img.order)) : 0,
            _id: img._id,
          });
        }
      });

      // New Businesses images
      newBusinessesImages.forEach((img) => {
        if (img.imageUrl) {
          bannersToSave.push({
            section: 'new-businesses',
            imageUrl: img.imageUrl,
            linkUrl: img.linkUrl || '#',
            title: img.offer || img.name || '',
            advertiser: img.name || '',
            ctaText: img.offer || '',
            rating: img.rating !== undefined && img.rating !== null ? parseFloat(String(img.rating)) : undefined,
            reviews: img.reviews !== undefined && img.reviews !== null ? parseInt(String(img.reviews)) : undefined,
            locationId: selectedLocation.id,
            area: selectedLocation.area || selectedLocation.displayName,
            pincode: selectedLocation.pincode ? parseInt(String(selectedLocation.pincode)) : undefined,
            lat: img.lat !== undefined && img.lat !== null ? parseFloat(String(img.lat)) : undefined,
            lng: img.lng !== undefined && img.lng !== null ? parseFloat(String(img.lng)) : undefined,
            isActive: true,
            order: img.order !== undefined && img.order !== null ? parseInt(String(img.order)) : 0,
            _id: img._id,
          });
        }
      });

      // Save all banners
      const saveResults = [];
      for (const banner of bannersToSave) {
        const { _id, ...bannerData } = banner;
        const url = _id ? `/api/admin/banners/${_id}` : '/api/admin/banners';
        const method = _id ? 'PUT' : 'POST';

        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bannerData),
          });

          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            const text = await response.text();
            console.error(`Failed to parse JSON response for ${banner.section} banner:`, text);
            saveResults.push({ 
              section: banner.section, 
              success: false, 
              error: `Invalid JSON response: ${text.substring(0, 100)}` 
            });
            continue;
          }
          
          if (!response.ok) {
            const errorMsg = data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
            console.error(`Failed to save ${banner.section} banner (HTTP ${response.status}):`, errorMsg);
            saveResults.push({ 
              section: banner.section, 
              success: false, 
              error: errorMsg 
            });
          } else if (!data.success) {
            const errorMsg = data?.error || 'Unknown error from API';
            const errorDetails = data?.details || '';
            const fullError = errorDetails ? `${errorMsg}: ${errorDetails}` : errorMsg;
            console.error(`Failed to save ${banner.section} banner:`, {
              error: errorMsg,
              details: errorDetails,
              fullError: data?.fullError,
              bannerData: bannerData
            });
            saveResults.push({ 
              section: banner.section, 
              success: false, 
              error: fullError 
            });
          } else {
            console.log(`Successfully saved ${banner.section} banner:`, data.banner);
            // Update the _id in state if this was a new banner
            if (!_id && data.banner) {
              if (banner.section === 'slider') {
                const updatedSliderImages = [...sliderImages];
                const index = updatedSliderImages.findIndex(img => 
                  img.imageUrl === banner.imageUrl && !img._id
                );
                if (index !== -1) {
                  updatedSliderImages[index] = {
                    ...updatedSliderImages[index],
                    _id: data.banner._id || data.banner._id?.toString(),
                  };
                  setSliderImages(updatedSliderImages);
                }
              } else if (banner.section === 'hero' && !heroImage._id) {
                setHeroImage({
                  ...heroImage,
                  _id: data.banner._id || data.banner._id?.toString(),
                });
              }
            }
            saveResults.push({ section: banner.section, success: true, banner: data.banner });
          }
        } catch (error: any) {
          console.error(`Error saving ${banner.section} banner:`, error);
          saveResults.push({ 
            section: banner.section, 
            success: false, 
            error: error.message || 'Network error' 
          });
        }
      }

      // Check if all saves were successful
      const failedSaves = saveResults.filter(r => !r.success);
      const successfulSaves = saveResults.filter(r => r.success);
      
      if (failedSaves.length > 0) {
        // Log detailed error information
        console.error('Failed saves details:', failedSaves);
        
        // Show detailed error message
        const failedDetails = failedSaves.map(r => `${r.section}: ${r.error || 'Unknown error'}`).join('; ');
        const errorMessage = successfulSaves.length > 0
          ? `Partially saved: ${successfulSaves.length} succeeded, ${failedSaves.length} failed. ${failedDetails}`
          : `Failed to save all images. ${failedDetails}`;
        toast.error(errorMessage, { duration: 8000 });
      } else {
        toast.success(
          <div className="flex flex-col gap-2">
            <div className="font-semibold">Successfully saved {successfulSaves.length} image(s)!</div>
            <div className="text-sm">
              Images are now live for location: <strong>{selectedLocation.displayName}</strong>
            </div>
            <a
              href={`/?loc=${selectedLocation.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium mt-1"
            >
              View on Site →
            </a>
          </div>,
          { duration: 5000 }
        );
        // Refresh the location data to show updated images
        if (selectedLocation) {
          await handleLocationSelect(selectedLocation);
        }
      }
    } catch (error) {
      toast.error('Failed to save images');
    } finally {
      setSaving(false);
    }
  };

  const filteredLocations = locations.filter((loc) => {
    if (searchType === 'area') {
      return loc.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             loc.area?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return loc.pincode === selectedPincode;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-custom-gradient rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🏪</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Adding Shop</h1>
            <p className="text-gray-600 mt-1">Manage shop images by location and pincode</p>
          </div>
        </div>
      </div>

      {/* Location Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-lg">📍</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Select Location / Pincode</h2>
        </div>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setSearchType('area')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              searchType === 'area'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🔍</span>
              By Area Name
            </span>
          </button>
          <button
            onClick={() => setSearchType('pincode')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              searchType === 'pincode'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>📮</span>
              By Pincode
            </span>
          </button>
        </div>

        {searchType === 'area' ? (
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search by area name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 placeholder:text-gray-400 bg-white transition-all"
            />
          </div>
        ) : (
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">📮</span>
            </div>
            <select
              value={selectedPincode}
              onChange={(e) => setSelectedPincode(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900 bg-white appearance-none transition-all"
            >
              <option value="" className="text-gray-900">Select Pincode</option>
              {pincodes.map((pincode) => (
                <option key={pincode} value={pincode} className="text-gray-900">
                  {pincode}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl bg-white shadow-inner">
          {filteredLocations.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500 font-medium">No locations found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredLocations.slice(0, 50).map((location) => (
            <button
              key={location._id}
              onClick={() => handleLocationSelect(location)}
              className={`w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                selectedLocation?._id === location._id 
                  ? 'bg-amber-50 border-l-4 border-amber-600 shadow-sm' 
                  : 'hover:border-l-2 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{location.displayName}</div>
                  {location.pincode && (
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <span>📮</span>
                      <span>Pincode: {location.pincode}</span>
                    </div>
                  )}
                </div>
                {selectedLocation?._id === location._id && (
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                )}
              </div>
            </button>
            ))
          )}
        </div>
      </div>

      {selectedLocation && (
        <div className="space-y-6">
          {/* Selected Location Info */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedLocation.displayName}</div>
                  {selectedLocation.pincode && (
                    <div className="text-sm text-gray-600">Pincode: {selectedLocation.pincode}</div>
                  )}
                </div>
              </div>
              <a
                href={`/?loc=${selectedLocation.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-amber-600 font-medium rounded-lg hover:bg-amber-50 border border-amber-300 transition-all duration-200 hover:shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <span>👁️</span>
                <span>View on Site</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">🖼️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Hero Image</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                {heroImage.imageUrl ? (
                  <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                    <Image src={heroImage.imageUrl} alt="Hero" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <button
                  onClick={() => handleImageUpload('hero')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Upload Image
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={heroImage.lat || ''}
                    onChange={(e) => setHeroImage({ ...heroImage, lat: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="25.5941"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={heroImage.lng || ''}
                    onChange={(e) => setHeroImage({ ...heroImage, lng: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-gray-900 bg-white placeholder:text-gray-400"
                    placeholder="85.1376"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slider Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Slider Images (Best Deals Slider)</h2>
              <button
                onClick={() => setSliderImages([...sliderImages, { imageUrl: '', lat: undefined, lng: undefined, order: sliderImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Slider Image
              </button>
            </div>
            {sliderImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No slider images added. Click "+ Add Slider Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sliderImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Slider Image {index + 1}</label>
                    {img.imageUrl ? (
                      <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Slider ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('slider', index)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {img.imageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...sliderImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setSliderImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...sliderImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setSliderImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={img.order || index}
                        onChange={(e) => {
                          const updated = [...sliderImages];
                          updated[index] = { ...updated[index], order: parseInt(e.target.value) || index };
                          setSliderImages(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Order"
                      />
                      <button
                        onClick={() => setSliderImages(sliderImages.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Left Rail Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">⬅️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Left Rail Images (4 images)</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {leftImages.map((img, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image {index + 1}</label>
                  {img.imageUrl ? (
                    <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                      <Image src={img.imageUrl} alt={`Left ${index + 1}`} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleImageUpload('left', index)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Upload
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={img.lat || ''}
                      onChange={(e) => {
                        const updated = [...leftImages];
                        updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                        setLeftImages(updated);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Lat"
                    />
                    <input
                      type="number"
                      step="any"
                      value={img.lng || ''}
                      onChange={(e) => {
                        const updated = [...leftImages];
                        updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                        setLeftImages(updated);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Lng"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Rail Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">➡️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Right Rail Images (4 images)</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {rightImages.map((img, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Image {index + 1}</label>
                  {img.imageUrl ? (
                    <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                      <Image src={img.imageUrl} alt={`Right ${index + 1}`} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-gray-500 text-sm">No image</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleImageUpload('right', index)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Upload
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={img.lat || ''}
                      onChange={(e) => {
                        const updated = [...rightImages];
                        updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                        setRightImages(updated);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Lat"
                    />
                    <input
                      type="number"
                      step="any"
                      value={img.lng || ''}
                      onChange={(e) => {
                        const updated = [...rightImages];
                        updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                        setRightImages(updated);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Lng"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Strip Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Bottom Strip Images</h2>
              </div>
              <button
                onClick={() => setBottomImages([...bottomImages, { imageUrl: '', lat: undefined, lng: undefined, order: bottomImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Image
              </button>
            </div>
            {bottomImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No images added. Click "+ Add Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bottomImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    {img.imageUrl ? (
                      <div className="relative w-full h-24 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Bottom ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('bottom', index)}
                      className="w-full px-2 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                    >
                      {img.imageUrl ? 'Change' : 'Upload'}
                    </button>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...bottomImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setBottomImages(updated);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...bottomImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setBottomImages(updated);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <button
                      onClick={() => setBottomImages(bottomImages.filter((_, i) => i !== index))}
                      className="w-full px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest Offers Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🎁</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Latest Offers</h2>
              </div>
              <button
                onClick={() => setLatestOffersImages([...latestOffersImages, { imageUrl: '', lat: undefined, lng: undefined, order: latestOffersImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Offer Image
              </button>
            </div>
            {latestOffersImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No offer images added. Click "+ Add Offer Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {latestOffersImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Offer Image {index + 1}</label>
                    {img.imageUrl ? (
                      <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Offer ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('latest-offers', index)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {img.imageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...latestOffersImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setLatestOffersImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...latestOffersImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setLatestOffersImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.name || ''}
                      onChange={(e) => {
                        const updated = [...latestOffersImages];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setLatestOffersImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Offer Title / Shop Name"
                    />
                    <input
                      type="text"
                      value={img.offer || ''}
                      onChange={(e) => {
                        const updated = [...latestOffersImages];
                        updated[index] = { ...updated[index], offer: e.target.value };
                        setLatestOffersImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Offer Text (e.g., '50% OFF', 'Save ₹500')"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={img.rating || ''}
                        onChange={(e) => {
                          const updated = [...latestOffersImages];
                          updated[index] = { ...updated[index], rating: e.target.value ? parseFloat(e.target.value) : undefined };
                          setLatestOffersImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Rating (0-5)"
                      />
                      <input
                        type="number"
                        min="0"
                        value={img.reviews || ''}
                        onChange={(e) => {
                          const updated = [...latestOffersImages];
                          updated[index] = { ...updated[index], reviews: e.target.value ? parseInt(e.target.value) : undefined };
                          setLatestOffersImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Reviews Count"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.linkUrl || ''}
                      onChange={(e) => {
                        const updated = [...latestOffersImages];
                        updated[index] = { ...updated[index], linkUrl: e.target.value };
                        setLatestOffersImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Link URL"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={img.order || index}
                        onChange={(e) => {
                          const updated = [...latestOffersImages];
                          updated[index] = { ...updated[index], order: parseInt(e.target.value) || index };
                          setLatestOffersImages(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Order"
                      />
                      <button
                        onClick={() => setLatestOffersImages(latestOffersImages.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Businesses Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⭐</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Featured Businesses</h2>
              </div>
              <button
                onClick={() => setFeaturedBusinessesImages([...featuredBusinessesImages, { imageUrl: '', lat: undefined, lng: undefined, order: featuredBusinessesImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Business Image
              </button>
            </div>
            {featuredBusinessesImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No business images added. Click "+ Add Business Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {featuredBusinessesImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Business Image {index + 1}</label>
                    {img.imageUrl ? (
                      <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Business ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('featured-businesses', index)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {img.imageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...featuredBusinessesImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setFeaturedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...featuredBusinessesImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setFeaturedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.name || ''}
                      onChange={(e) => {
                        const updated = [...featuredBusinessesImages];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setFeaturedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Business Name"
                    />
                    <input
                      type="text"
                      value={img.offer || ''}
                      onChange={(e) => {
                        const updated = [...featuredBusinessesImages];
                        updated[index] = { ...updated[index], offer: e.target.value };
                        setFeaturedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Offer Text (optional)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={img.rating || ''}
                        onChange={(e) => {
                          const updated = [...featuredBusinessesImages];
                          updated[index] = { ...updated[index], rating: e.target.value ? parseFloat(e.target.value) : undefined };
                          setFeaturedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Rating (0-5)"
                      />
                      <input
                        type="number"
                        min="0"
                        value={img.reviews || ''}
                        onChange={(e) => {
                          const updated = [...featuredBusinessesImages];
                          updated[index] = { ...updated[index], reviews: e.target.value ? parseInt(e.target.value) : undefined };
                          setFeaturedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Reviews Count"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.linkUrl || ''}
                      onChange={(e) => {
                        const updated = [...featuredBusinessesImages];
                        updated[index] = { ...updated[index], linkUrl: e.target.value };
                        setFeaturedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Link URL"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={img.order || index}
                        onChange={(e) => {
                          const updated = [...featuredBusinessesImages];
                          updated[index] = { ...updated[index], order: parseInt(e.target.value) || index };
                          setFeaturedBusinessesImages(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Order"
                      />
                      <button
                        onClick={() => setFeaturedBusinessesImages(featuredBusinessesImages.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Rated Businesses Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏆</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Top Rated Businesses</h2>
              </div>
              <button
                onClick={() => setTopRatedBusinessesImages([...topRatedBusinessesImages, { imageUrl: '', lat: undefined, lng: undefined, order: topRatedBusinessesImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Business Image
              </button>
            </div>
            {topRatedBusinessesImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No business images added. Click "+ Add Business Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topRatedBusinessesImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Business Image {index + 1}</label>
                    {img.imageUrl ? (
                      <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Business ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('top-rated-businesses', index)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {img.imageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...topRatedBusinessesImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setTopRatedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...topRatedBusinessesImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setTopRatedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.name || ''}
                      onChange={(e) => {
                        const updated = [...topRatedBusinessesImages];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setTopRatedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Business Name"
                    />
                    <input
                      type="text"
                      value={img.offer || ''}
                      onChange={(e) => {
                        const updated = [...topRatedBusinessesImages];
                        updated[index] = { ...updated[index], offer: e.target.value };
                        setTopRatedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Offer Text (optional)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={img.rating || ''}
                        onChange={(e) => {
                          const updated = [...topRatedBusinessesImages];
                          updated[index] = { ...updated[index], rating: e.target.value ? parseFloat(e.target.value) : undefined };
                          setTopRatedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Rating (0-5)"
                      />
                      <input
                        type="number"
                        min="0"
                        value={img.reviews || ''}
                        onChange={(e) => {
                          const updated = [...topRatedBusinessesImages];
                          updated[index] = { ...updated[index], reviews: e.target.value ? parseInt(e.target.value) : undefined };
                          setTopRatedBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Reviews Count"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.linkUrl || ''}
                      onChange={(e) => {
                        const updated = [...topRatedBusinessesImages];
                        updated[index] = { ...updated[index], linkUrl: e.target.value };
                        setTopRatedBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Link URL"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={img.order || index}
                        onChange={(e) => {
                          const updated = [...topRatedBusinessesImages];
                          updated[index] = { ...updated[index], order: parseInt(e.target.value) || index };
                          setTopRatedBusinessesImages(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Order"
                      />
                      <button
                        onClick={() => setTopRatedBusinessesImages(topRatedBusinessesImages.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Businesses Images */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🆕</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">New Businesses</h2>
              </div>
              <button
                onClick={() => setNewBusinessesImages([...newBusinessesImages, { imageUrl: '', lat: undefined, lng: undefined, order: newBusinessesImages.length }])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                + Add Business Image
              </button>
            </div>
            {newBusinessesImages.length === 0 ? (
              <p className="text-gray-500 text-sm">No business images added. Click "+ Add Business Image" to add one.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newBusinessesImages.map((img, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Business Image {index + 1}</label>
                    {img.imageUrl ? (
                      <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden mb-2">
                        <Image src={img.imageUrl} alt={`Business ${index + 1}`} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-sm">No image</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleImageUpload('new-businesses', index)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {img.imageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={img.lat || ''}
                        onChange={(e) => {
                          const updated = [...newBusinessesImages];
                          updated[index] = { ...updated[index], lat: e.target.value ? parseFloat(e.target.value) : undefined };
                          setNewBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lat"
                      />
                      <input
                        type="number"
                        step="any"
                        value={img.lng || ''}
                        onChange={(e) => {
                          const updated = [...newBusinessesImages];
                          updated[index] = { ...updated[index], lng: e.target.value ? parseFloat(e.target.value) : undefined };
                          setNewBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Lng"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.name || ''}
                      onChange={(e) => {
                        const updated = [...newBusinessesImages];
                        updated[index] = { ...updated[index], name: e.target.value };
                        setNewBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Business Name"
                    />
                    <input
                      type="text"
                      value={img.offer || ''}
                      onChange={(e) => {
                        const updated = [...newBusinessesImages];
                        updated[index] = { ...updated[index], offer: e.target.value };
                        setNewBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Offer Text (optional)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={img.rating || ''}
                        onChange={(e) => {
                          const updated = [...newBusinessesImages];
                          updated[index] = { ...updated[index], rating: e.target.value ? parseFloat(e.target.value) : undefined };
                          setNewBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Rating (0-5)"
                      />
                      <input
                        type="number"
                        min="0"
                        value={img.reviews || ''}
                        onChange={(e) => {
                          const updated = [...newBusinessesImages];
                          updated[index] = { ...updated[index], reviews: e.target.value ? parseInt(e.target.value) : undefined };
                          setNewBusinessesImages(updated);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Reviews Count"
                      />
                    </div>
                    <input
                      type="text"
                      value={img.linkUrl || ''}
                      onChange={(e) => {
                        const updated = [...newBusinessesImages];
                        updated[index] = { ...updated[index], linkUrl: e.target.value };
                        setNewBusinessesImages(updated);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                      placeholder="Link URL"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={img.order || index}
                        onChange={(e) => {
                          const updated = [...newBusinessesImages];
                          updated[index] = { ...updated[index], order: parseInt(e.target.value) || index };
                          setNewBusinessesImages(updated);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder:text-gray-400"
                        placeholder="Order"
                      />
                      <button
                        onClick={() => setNewBusinessesImages(newBusinessesImages.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-custom-gradient text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save All Images'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

