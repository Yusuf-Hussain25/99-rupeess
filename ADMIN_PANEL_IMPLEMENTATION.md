# Admin Control Panel - Implementation Guide

## 📁 Folder Structure

```
app/
├── (admin)/
│   └── admin/
│       ├── layout.tsx                    # Admin layout with navigation
│       ├── page.tsx                      # Dashboard (already exists)
│       ├── banners/
│       │   └── page.tsx                  # Banner management (already exists)
│       ├── locations/
│       │   └── page.tsx                  # Location management (already exists)
│       ├── layout/
│       │   └── page.tsx                  # Layout config (left/right bar, bottom strip)
│       ├── categories/
│       │   └── page.tsx                  # Categories CRUD ✅ Created
│       ├── businesses/
│       │   └── page.tsx                  # Businesses CRUD
│       ├── offers/
│       │   └── page.tsx                  # Special offers CRUD
│       ├── pages/
│       │   └── page.tsx                  # Dynamic pages management
│       ├── inbox/
│       │   └── page.tsx                  # Messages/contact form inbox
│       └── distance/
│           └── page.tsx                  # Distance configuration

api/
└── admin/
    ├── categories/
    │   ├── route.ts                      # GET, POST ✅ Created
    │   └── [id]/
    │       └── route.ts                  # GET, PUT, DELETE ✅ Created
    ├── businesses/
    │   ├── route.ts                      # GET, POST ✅ Created
    │   └── [id]/
    │       ├── route.ts                  # GET, PUT, DELETE ✅ Created
    │       └── toggle-featured/
    │           └── route.ts              # PATCH ✅ Created
    ├── offers/
    │   ├── route.ts                      # GET, POST ✅ Created
    │   └── [id]/
    │       └── route.ts                  # GET, PUT, DELETE ✅ Created
    ├── layout/
    │   └── route.ts                      # GET, PUT ✅ Created
    ├── distance/
    │   └── route.ts                      # GET, PUT ✅ Created
    ├── messages/
    │   ├── route.ts                      # GET, POST ✅ Created
    │   └── [id]/
    │       └── route.ts                  # GET, PATCH, DELETE ✅ Created
    └── pages/
        ├── route.ts                      # GET, POST ✅ Created
        └── [id]/
            ├── route.ts                  # GET, PUT, DELETE ✅ Created
            └── duplicate/
                └── route.ts              # POST ✅ Created

models/
├── Category.ts                           # ✅ Created
├── Business.ts                           # ✅ Created
├── Offer.ts                              # ✅ Created
├── LayoutConfig.ts                       # ✅ Created
├── DistanceConfig.ts                     # ✅ Created
├── Message.ts                            # ✅ Created
└── Page.ts                               # ✅ Created
```

## 🗄️ Database Models

All models are created in `/models/` directory:

1. **Category** - Business categories
2. **Business** - Business listings with location data
3. **Offer** - Special offers/deals
4. **LayoutConfig** - Left/right bar, bottom strip, featured businesses
5. **DistanceConfig** - Distance search configuration
6. **Message** - Contact form submissions
7. **Page** - Dynamic pages

## 🔌 API Routes

All API routes are protected with `requireAdmin` middleware and located in `/app/api/admin/`.

### Categories
- `GET /api/admin/categories` - List all
- `POST /api/admin/categories` - Create
- `GET /api/admin/categories/[id]` - Get one
- `PUT /api/admin/categories/[id]` - Update
- `DELETE /api/admin/categories/[id]` - Delete

### Businesses
- `GET /api/admin/businesses` - List all (with filters)
- `POST /api/admin/businesses` - Create
- `GET /api/admin/businesses/[id]` - Get one
- `PUT /api/admin/businesses/[id]` - Update
- `DELETE /api/admin/businesses/[id]` - Delete
- `PATCH /api/admin/businesses/[id]/toggle-featured` - Toggle featured

### Offers
- `GET /api/admin/offers` - List all
- `POST /api/admin/offers` - Create
- `GET /api/admin/offers/[id]` - Get one
- `PUT /api/admin/offers/[id]` - Update
- `DELETE /api/admin/offers/[id]` - Delete

### Layout Config
- `GET /api/admin/layout` - Get config
- `PUT /api/admin/layout` - Update config

### Distance Config
- `GET /api/admin/distance` - Get config
- `PUT /api/admin/distance` - Update config

### Messages
- `GET /api/admin/messages` - List all (with status filter)
- `POST /api/admin/messages` - Create (public endpoint for contact form)
- `GET /api/admin/messages/[id]` - Get one
- `PATCH /api/admin/messages/[id]` - Update status
- `DELETE /api/admin/messages/[id]` - Delete

### Pages
- `GET /api/admin/pages` - List all
- `POST /api/admin/pages` - Create
- `GET /api/admin/pages/[id]` - Get one
- `PUT /api/admin/pages/[id]` - Update
- `DELETE /api/admin/pages/[id]` - Delete
- `POST /api/admin/pages/[id]/duplicate` - Duplicate page

## 🎨 Admin UI Pages

### Completed
- ✅ Dashboard (`/admin`)
- ✅ Banners (`/admin/banners`)
- ✅ Locations (`/admin/locations`)
- ✅ Categories (`/admin/categories`)

### To Create
- Layout Management (`/admin/layout`)
- Businesses (`/admin/businesses`)
- Offers (`/admin/offers`)
- Pages (`/admin/pages`)
- Inbox (`/admin/inbox`)
- Distance (`/admin/distance`)

## 🔐 Authentication

All admin routes are protected by:
1. `requireAdmin` middleware in API routes
2. Admin layout checks user role
3. Redirects to `/login?redirect=/admin` if not authenticated

## 📝 Usage Examples

### Creating a Category
```typescript
POST /api/admin/categories
{
  "name": "Restaurants",
  "slug": "restaurants", // auto-generated if not provided
  "description": "Food and dining",
  "isActive": true
}
```

### Creating a Business
```typescript
POST /api/admin/businesses
{
  "name": "Pizza Palace",
  "categoryId": "category_id_here",
  "address": "123 Main St",
  "pincode": "801101",
  "area": "A.H. Guard",
  "latitude": 25.5941,
  "longitude": 85.1376,
  "isFeatured": true
}
```

### Updating Layout Config
```typescript
PUT /api/admin/layout
{
  "leftBarContent": [
    { "title": "Food", "link": "/category/restaurants", "order": 0 }
  ],
  "rightBarContent": [...],
  "bottomStripText": "Special offer today!",
  "bottomStripLink": "/offers",
  "featuredBusinessIds": ["business_id_1", "business_id_2"]
}
```

## 🚀 Next Steps

1. Create remaining UI pages (Businesses, Offers, Pages, Inbox, Distance, Layout)
2. Add form validation (client + server)
3. Add loading states and error handling
4. Add search/filter functionality to tables
5. Add pagination for large datasets
6. Create public API endpoints for frontend consumption

## 📦 Dependencies

All required dependencies should already be installed:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `react-hot-toast` - Notifications

## 🔧 Environment Variables

Ensure these are set in `.env.local`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

