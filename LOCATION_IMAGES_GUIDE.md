# Location-Based Image Management Guide

## Overview

This feature allows admins to manage images for specific locations. Images can be uploaded and configured for:
- Hero banner (1 image)
- Left Rail (4 images)
- Right Rail (4 images)
- Bottom Strip (multiple images)

Each image can have latitude and longitude coordinates for distance-based sorting.

## Features

### 1. Location Import
- Import all locations from `patna_full_locations.json` into the database
- Click "Import Locations from JSON" button in the Location Images page
- Locations are automatically created with proper IDs, pincodes, and area names

### 2. Location Selection
Two methods to select a location:
- **By Area Name**: Search by typing the area name (e.g., "A.H. Guard")
- **By Pincode**: Select from a dropdown of all available pincodes

### 3. Image Management
For each location, you can:
- Upload images directly from your computer
- Set latitude and longitude for each image
- Images are automatically saved to `/public/uploads/` directory
- Images are linked to the selected location

### 4. Sections

#### Hero Image
- Single image for the main hero banner
- Requires lat/lng for distance calculation

#### Left Rail (4 images)
- Exactly 4 image slots
- Each can have its own lat/lng
- Images are displayed in order (0, 1, 2, 3)

#### Right Rail (4 images)
- Exactly 4 image slots
- Each can have its own lat/lng
- Images are displayed in order (0, 1, 2, 3)

#### Bottom Strip (Multiple images)
- Can add unlimited images
- Each can have its own lat/lng
- Images are displayed in order

## How to Use

### Step 1: Import Locations
1. Go to `/admin/location-images`
2. Click "Import Locations from JSON"
3. Wait for import to complete
4. You'll see a success message with import statistics

### Step 2: Select a Location
1. Choose search method (Area Name or Pincode)
2. If searching by area, type the area name
3. If searching by pincode, select from dropdown
4. Click on a location from the results

### Step 3: Upload Images
1. For each section, click "Upload" or "Upload Image"
2. Select an image from your computer
3. Image will be uploaded and preview will appear
4. Enter latitude and longitude for the image (optional but recommended for distance sorting)

### Step 4: Save
1. After uploading all images and entering coordinates
2. Click "Save All Images" button
3. Images are saved to the database linked to the selected location

## Database Structure

### Location Model
```typescript
{
  id: string,           // Unique ID (e.g., "a-h-guard-801101")
  city: string,         // "Patna"
  state: string,        // "Bihar"
  displayName: string,  // "A.H. Guard"
  pincode: number,      // 801101
  area: string,         // "A.H. Guard"
  isActive: boolean
}
```

### Banner Model (for location images)
```typescript
{
  section: 'hero' | 'left' | 'right' | 'top',
  imageUrl: string,
  locationId: string,   // Links to location
  area: string,         // Location area name
  pincode: number,      // Location pincode
  lat: number,          // Image latitude
  lng: number,          // Image longitude
  order: number,        // Display order
  isActive: boolean
}
```

## Frontend Integration

The main website automatically fetches location-specific images:

1. **HeroSection** component fetches banners using `location.id`:
   ```typescript
   fetch(`/api/banners?section=hero&loc=${location.id}&limit=1`)
   ```

2. **LeftRail** and **RightRail** receive banners with lat/lng:
   - Banners are sorted by distance if user location is available
   - Distance is calculated using Haversine formula
   - Uses banner lat/lng if available, otherwise falls back to shop.json lookup

3. **Distance Calculation**:
   - Priority: Banner lat/lng > shop.json lookup
   - Distance displayed on hover (desktop) or as badge (mobile)

## API Endpoints

### Import Locations
```
POST /api/admin/locations/import
Headers: Authorization: Bearer <token>
Response: { success: true, stats: { imported, skipped, errors, total } }
```

### Get Location Banners
```
GET /api/admin/banners?locationId=<location_id>
Headers: Authorization: Bearer <token>
Response: { success: true, banners: [...] }
```

### Public Banner Fetch (for frontend)
```
GET /api/banners?section=left&loc=<location_id>&limit=4
Response: { banners: [...] }
```

## Best Practices

1. **Import locations first** before managing images
2. **Always set lat/lng** for images to enable distance-based sorting
3. **Use consistent image sizes** for each section:
   - Hero: Large banner size (recommended: 1200x600px)
   - Left/Right Rail: Square or portrait (recommended: 300x300px)
   - Bottom Strip: Small logos (recommended: 150x100px)
4. **Test on main website** after saving to verify changes appear
5. **Keep images optimized** (use WebP format when possible)

## Troubleshooting

### Images not showing on main website
1. Check if location is selected correctly on main site
2. Verify banners are saved with correct `locationId`
3. Check if banners have `isActive: true`
4. Verify image URLs are accessible

### Distance not calculating
1. Ensure lat/lng are set for images
2. Check if user location is available
3. Verify coordinates are valid numbers

### Import fails
1. Check if `patna_full_locations.json` exists in `/app/` directory
2. Verify JSON format is correct
3. Check MongoDB connection
4. Some locations may be skipped if they already exist (this is normal)

## File Structure

```
app/
├── patna_full_locations.json          # Source location data
├── (admin)/
│   └── admin/
│       └── location-images/
│           └── page.tsx                # Location image management UI
└── api/
    └── admin/
        └── locations/
            └── import/
                └── route.ts            # Import endpoint
```

## Next Steps

After setting up location images:
1. Test on main website with different locations
2. Verify distance sorting works correctly
3. Add more locations as needed
4. Update images periodically to keep content fresh

