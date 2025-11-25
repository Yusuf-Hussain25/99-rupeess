import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance } from '@/app/utils/distance';
import { MOCK_SHOPS, type MockShop } from '@/app/data/mockShops';
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

interface ShopWithDistance {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  city: string;
  state?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  description?: string;
  offerPercent?: number;
  priceLevel?: string;
  tags?: string[];
  featured?: boolean;
  sponsored?: boolean;
  distance: number; // Distance in kilometers
}

/**
 * GET /api/shops/nearby
 * 
 * Query parameters:
 * - userLat: User's latitude (required)
 * - userLng: User's longitude (required)
 * - radiusKm: Search radius in kilometers (optional, default: 10)
 * - useMongoDB: Whether to use MongoDB or mock data (optional, default: false)
 * 
 * Returns shops sorted by distance, filtered by radius
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userLat = searchParams.get('userLat');
    const userLng = searchParams.get('userLng');
    const radiusKm = searchParams.get('radiusKm');
    const useMongoDB = searchParams.get('useMongoDB') === 'true';

    // Validate required parameters
    if (!userLat || !userLng) {
      return NextResponse.json(
        { error: 'userLat and userLng are required query parameters' },
        { status: 400 }
      );
    }

    const userLatNum = parseFloat(userLat);
    const userLngNum = parseFloat(userLng);
    const radiusKmNum = radiusKm ? parseFloat(radiusKm) : 10; // Default 10km

    // Validate coordinates
    if (isNaN(userLatNum) || isNaN(userLngNum)) {
      return NextResponse.json(
        { error: 'Invalid coordinates. userLat and userLng must be valid numbers' },
        { status: 400 }
      );
    }

    if (userLatNum < -90 || userLatNum > 90 || userLngNum < -180 || userLngNum > 180) {
      return NextResponse.json(
        { error: 'Coordinates out of valid range' },
        { status: 400 }
      );
    }

    if (isNaN(radiusKmNum) || radiusKmNum <= 0) {
      return NextResponse.json(
        { error: 'radiusKm must be a positive number' },
        { status: 400 }
      );
    }

    let shops: Array<MockShop | any> = [];

    // Load shops from MongoDB or mock data
    if (useMongoDB) {
      try {
        await connectDB();
        const dbShops = await Shop.find({}).lean();
        shops = dbShops.map((shop) => ({
          id: shop._id.toString(),
          name: shop.name,
          category: shop.category,
          imageUrl: shop.imageUrl,
          rating: shop.rating,
          reviews: shop.reviews,
          city: shop.city,
          state: shop.state,
          address: shop.address,
          phone: shop.phone,
          email: shop.email,
          website: shop.website,
          latitude: shop.latitude,
          longitude: shop.longitude,
          description: shop.description,
          offerPercent: shop.offerPercent,
          priceLevel: shop.priceLevel,
          tags: shop.tags,
          featured: shop.featured,
          sponsored: shop.sponsored,
        }));
      } catch (dbError) {
        console.error('MongoDB error, falling back to mock data:', dbError);
        // Fallback to mock data if MongoDB fails
        shops = MOCK_SHOPS;
      }
    } else {
      // Use mock data
      shops = MOCK_SHOPS;
    }

    // Calculate distance for each shop and filter by radius
    const shopsWithDistance: ShopWithDistance[] = shops
      .map((shop) => {
        const distance = calculateDistance(
          userLatNum,
          userLngNum,
          shop.latitude,
          shop.longitude
        );

        return {
          id: shop.id,
          name: shop.name,
          category: shop.category,
          imageUrl: shop.imageUrl,
          rating: shop.rating,
          reviews: shop.reviews,
          city: shop.city,
          state: shop.state,
          address: shop.address,
          phone: shop.phone,
          email: shop.email,
          website: shop.website,
          latitude: shop.latitude,
          longitude: shop.longitude,
          description: shop.description,
          offerPercent: shop.offerPercent,
          priceLevel: shop.priceLevel,
          tags: shop.tags,
          featured: shop.featured,
          sponsored: shop.sponsored,
          distance,
        };
      })
      .filter((shop) => shop.distance <= radiusKmNum) // Filter by radius
      .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

    return NextResponse.json(
      {
        success: true,
        shops: shopsWithDistance,
        count: shopsWithDistance.length,
        radiusKm: radiusKmNum,
        userLocation: {
          latitude: userLatNum,
          longitude: userLngNum,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in /api/shops/nearby:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

