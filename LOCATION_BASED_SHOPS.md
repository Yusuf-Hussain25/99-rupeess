# Location-Based Shop Listing System

This system allows you to find nearby shops based on user's location using the Haversine formula for distance calculation.

## Features

- ✅ Browser geolocation integration
- ✅ Haversine distance calculation (no external APIs)
- ✅ Distance-based sorting
- ✅ Radius filtering (3km, 5km, 10km, etc.)
- ✅ Works with mock data or MongoDB
- ✅ Returns shops with distance in kilometers

## API Endpoint

### `GET /api/shops/nearby`

Find shops near a user's location.

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `userLat` | number | Yes | - | User's latitude (-90 to 90) |
| `userLng` | number | Yes | - | User's longitude (-180 to 180) |
| `radiusKm` | number | No | 10 | Search radius in kilometers |
| `useMongoDB` | boolean | No | false | Use MongoDB instead of mock data |

#### Example Request

```bash
# Using mock data (default)
GET /api/shops/nearby?userLat=25.5941&userLng=85.1376&radiusKm=5

# Using MongoDB
GET /api/shops/nearby?userLat=25.5941&userLng=85.1376&radiusKm=10&useMongoDB=true
```

#### Example Response

```json
{
  "success": true,
  "shops": [
    {
      "id": "shop-1",
      "name": "The Urban Tandoor",
      "category": "Restaurant",
      "imageUrl": "https://...",
      "rating": 4.8,
      "reviews": 368,
      "city": "Patna",
      "state": "Bihar",
      "address": "Fraser Road, Patna",
      "phone": "+91 612 2345678",
      "latitude": 25.6100,
      "longitude": 85.1300,
      "description": "Modern Indian kitchen...",
      "offerPercent": 20,
      "priceLevel": "₹₹₹",
      "tags": ["Fine dining", "Live music"],
      "featured": true,
      "distance": 1.8
    },
    {
      "id": "shop-2",
      "name": "Bao & Biryani Co.",
      "category": "Restaurant",
      "distance": 2.3,
      ...
    }
  ],
  "count": 2,
  "radiusKm": 5,
  "userLocation": {
    "latitude": 25.5941,
    "longitude": 85.1376
  }
}
```

## Frontend Integration

### 1. Get User Location

```typescript
// Get user's current location
function getUserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
```

### 2. Fetch Nearby Shops

```typescript
async function fetchNearbyShops(
  userLat: number,
  userLng: number,
  radiusKm: number = 10
) {
  try {
    const response = await fetch(
      `/api/shops/nearby?userLat=${userLat}&userLng=${userLng}&radiusKm=${radiusKm}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch nearby shops');
    }
    
    const data = await response.json();
    return data.shops; // Array of shops sorted by distance
  } catch (error) {
    console.error('Error fetching nearby shops:', error);
    throw error;
  }
}
```

### 3. Complete Example Component

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function NearbyShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);

  useEffect(() => {
    // Request location permission and fetch shops
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          setLoading(true);
          try {
            const response = await fetch(
              `/api/shops/nearby?userLat=${lat}&userLng=${lng}&radiusKm=${radiusKm}`
            );
            const data = await response.json();
            setShops(data.shops);
          } catch (err) {
            setError('Failed to load shops');
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError('Location access denied');
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  }, [radiusKm]);

  return (
    <div>
      <div>
        <label>Radius: </label>
        <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}>
          <option value={3}>3 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
        </select>
      </div>

      {loading && <p>Loading nearby shops...</p>}
      {error && <p>Error: {error}</p>}
      
      {shops.map((shop) => (
        <div key={shop.id}>
          <h3>{shop.name}</h3>
          <p>{shop.distance} km away</p>
          <p>{shop.address}</p>
        </div>
      ))}
    </div>
  );
}
```

## MongoDB Setup

If you want to use MongoDB instead of mock data:

1. **Create shops in MongoDB:**

```typescript
import connectDB from '@/lib/mongodb';
import Shop from '@/models/Shop';

await connectDB();

await Shop.create({
  name: 'The Urban Tandoor',
  category: 'Restaurant',
  imageUrl: 'https://...',
  rating: 4.8,
  reviews: 368,
  city: 'Patna',
  state: 'Bihar',
  address: 'Fraser Road, Patna',
  phone: '+91 612 2345678',
  latitude: 25.6100,
  longitude: 85.1300,
  description: 'Modern Indian kitchen...',
  offerPercent: 20,
  priceLevel: '₹₹₹',
  tags: ['Fine dining', 'Live music'],
  featured: true,
});
```

2. **Use MongoDB in API calls:**

```typescript
// Add ?useMongoDB=true to the query string
const response = await fetch(
  `/api/shops/nearby?userLat=${lat}&userLng=${lng}&radiusKm=10&useMongoDB=true`
);
```

## Files Created

1. **`app/utils/distance.ts`** - Haversine distance calculation utility
2. **`models/Shop.ts`** - MongoDB Shop model with coordinates
3. **`app/data/mockShops.ts`** - Mock shop data with coordinates for Patna
4. **`app/api/shops/nearby/route.ts`** - API route for nearby shops

## Distance Calculation

The Haversine formula calculates the great-circle distance between two points on a sphere (Earth). The result is in kilometers, rounded to 1 decimal place.

Formula:
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c
```

Where:
- R = Earth's radius (6371 km)
- lat1, lng1 = User's coordinates
- lat2, lng2 = Shop's coordinates

## Notes

- All coordinates must be in decimal degrees (WGS84)
- Distance is calculated in kilometers
- Shops are automatically sorted by distance (nearest first)
- Shops outside the specified radius are filtered out
- The system works with or without MongoDB

