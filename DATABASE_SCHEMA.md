# Database Schema Overview - 99 Rupeess Website

This document provides a comprehensive overview of all database models and their relationships in the 99 Rupeess website.

---

## 📊 Database Collections

### 1. **User** (`users`)
**Purpose**: User authentication and authorization

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | User's full name (2-50 chars) |
| `email` | String | ✅ | Unique email address |
| `password` | String | ✅ | Hashed password (min 6 chars) |
| `phone` | String | ✅ | Unique phone number |
| `role` | Enum | ✅ | `'user'` or `'admin'` (default: `'user'`) |
| `isEmailVerified` | Boolean | ✅ | Email verification status (default: `false`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `email` (unique), `phone` (unique)

**Methods**: `comparePassword(candidatePassword)` - Compare password with hash

---

### 2. **Location** (`locations`)
**Purpose**: Store location/pincode data for location-based services

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | String | ✅ | Unique identifier (e.g., "a-h-guard-801101") |
| `city` | String | ✅ | City name |
| `state` | String | ❌ | State name |
| `country` | String | ✅ | Country (default: "India") |
| `displayName` | String | ✅ | Display name for UI |
| `pincode` | Number | ❌ | Pincode |
| `district` | String | ❌ | District name |
| `area` | String | ❌ | Area name (e.g., "A.H. Guard", "B.C. Road") |
| `latitude` | Number | ❌ | Latitude coordinate |
| `longitude` | Number | ❌ | Longitude coordinate |
| `isActive` | Boolean | ✅ | Active status (default: `true`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `id` (unique)
- `city` + `area` (compound)
- `pincode`
- `isActive`

---

### 3. **Banner** (`banners`)
**Purpose**: Store banner/shop images for different sections of the website

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `section` | Enum | ✅ | Section: `'hero'`, `'left'`, `'right'`, `'top'`, `'bottom'`, `'slider'`, `'latest-offers'`, `'featured-businesses'`, `'top-rated-businesses'`, `'new-businesses'` |
| `imageUrl` | String | ✅ | Image URL |
| `title` | String | ❌ | Banner title |
| `cta` | String | ❌ | Call-to-action text |
| `ctaText` | String | ❌ | CTA button text |
| `linkUrl` | String | ✅ | Link URL (default: `'#'`) |
| `alt` | String | ❌ | Image alt text |
| `advertiser` | String | ❌ | Business/shop name |
| `sponsored` | Boolean | ✅ | Sponsored status (default: `false`) |
| `position` | Number | ❌ | Position number |
| `rating` | Number | ❌ | Business rating (0-5) |
| `reviews` | Number | ❌ | Number of reviews |
| `area` | String | ❌ | Area name |
| `pincode` | Number | ❌ | Pincode |
| `locationId` | String | ❌ | Reference to location ID |
| `lat` | Number | ❌ | Latitude for distance calculation |
| `lng` | Number | ❌ | Longitude for distance calculation |
| `isActive` | Boolean | ✅ | Active status (default: `true`) |
| `order` | Number | ✅ | Display order/priority (default: `0`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `section` + `isActive` + `order` (compound)
- `area` + `pincode` (compound)
- `locationId`

---

### 4. **Shop** (`shops`)
**Purpose**: Store shop/business information with coordinates

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Shop name |
| `category` | String | ✅ | Category name |
| `imageUrl` | String | ✅ | Shop image URL |
| `rating` | Number | ✅ | Rating (0-5, default: `0`) |
| `reviews` | Number | ✅ | Number of reviews (default: `0`) |
| `city` | String | ✅ | City name |
| `state` | String | ❌ | State name |
| `address` | String | ✅ | Full address |
| `phone` | String | ❌ | Phone number |
| `email` | String | ❌ | Email address |
| `website` | String | ❌ | Website URL |
| `latitude` | Number | ✅ | Latitude (-90 to 90) |
| `longitude` | Number | ✅ | Longitude (-180 to 180) |
| `description` | String | ❌ | Shop description |
| `offerPercent` | Number | ❌ | Offer percentage (0-100) |
| `priceLevel` | String | ❌ | Price level |
| `tags` | [String] | ❌ | Tags array |
| `featured` | Boolean | ✅ | Featured status (default: `false`) |
| `sponsored` | Boolean | ✅ | Sponsored status (default: `false`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `latitude` + `longitude` (geospatial)
- `category`
- `city`
- `featured`
- `rating` (descending)

---

### 5. **Category** (`categories`)
**Purpose**: Store business categories

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Category name (max 100 chars) |
| `slug` | String | ✅ | Unique URL slug (lowercase, alphanumeric with hyphens) |
| `description` | String | ❌ | Description (max 500 chars) |
| `imageUrl` | String | ❌ | Category image URL |
| `latitude` | Number | ❌ | Latitude (-90 to 90) |
| `longitude` | Number | ❌ | Longitude (-180 to 180) |
| `isActive` | Boolean | ✅ | Active status (default: `true`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `isActive`, `slug` (unique)

---

### 6. **Business** (`businesses`)
**Purpose**: Store business information with geospatial data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Business name (max 200 chars) |
| `slug` | String | ✅ | Unique URL slug |
| `categoryId` | ObjectId | ✅ | Reference to Category |
| `address` | String | ✅ | Business address |
| `pincode` | String | ✅ | Pincode |
| `area` | String | ✅ | Area name |
| `imageUrl` | String | ❌ | Business image URL |
| `latitude` | Number | ❌ | Latitude |
| `longitude` | Number | ❌ | Longitude |
| `location` | GeoJSON | Auto | GeoJSON Point (auto-created from lat/lng) |
| `isFeatured` | Boolean | ✅ | Featured status (default: `false`) |
| `specialOffers` | [ObjectId] | ❌ | Array of Offer references |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `categoryId`
- `isFeatured`
- `location` (2dsphere - geospatial)
- `categoryId` + `location` (compound)
- `isFeatured` + `location` (compound)
- `slug` (unique)

**Pre-save Hook**: Automatically creates GeoJSON `location` from `latitude` and `longitude`

---

### 7. **Offer** (`offers`)
**Purpose**: Store special offers and promotions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ | Offer title (max 200 chars) |
| `description` | String | ❌ | Offer description (max 1000 chars) |
| `businessId` | ObjectId | ❌ | Reference to Business |
| `isActive` | Boolean | ✅ | Active status (default: `true`) |
| `startDate` | Date | ❌ | Offer start date |
| `endDate` | Date | ❌ | Offer end date |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `businessId`
- `isActive`
- `startDate` + `endDate` (compound)

---

### 8. **Page** (`pages`)
**Purpose**: Store static pages content

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ | Page title (max 200 chars) |
| `slug` | String | ✅ | Unique URL slug |
| `content` | String | ✅ | Page content (HTML/text) |
| `seoTitle` | String | ❌ | SEO title (max 60 chars) |
| `seoDescription` | String | ❌ | SEO description (max 160 chars) |
| `isPublished` | Boolean | ✅ | Published status (default: `true`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: `isPublished`, `slug` (unique)

---

### 9. **Message** (`messages`)
**Purpose**: Store contact form messages

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Sender name (max 100 chars) |
| `email` | String | ✅ | Sender email |
| `phone` | String | ❌ | Sender phone |
| `subject` | String | ✅ | Message subject (max 200 chars) |
| `message` | String | ✅ | Message content (max 5000 chars) |
| `status` | Enum | ✅ | `'new'`, `'read'`, or `'archived'` (default: `'new'`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes**: 
- `status`
- `createdAt` (descending)
- `email`

---

### 10. **DistanceConfig** (`distanceconfigs`)
**Purpose**: Store distance calculation configuration (singleton)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `maxDistanceKm` | Number | ✅ | Maximum distance in km (default: `10`, min: `1`) |
| `defaultDistanceKm` | Number | ✅ | Default distance in km (default: `5`, min: `1`) |
| `distanceUnit` | Enum | ✅ | `'km'` or `'miles'` (default: `'km'`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Static Method**: `getConfig()` - Returns single config document (creates if doesn't exist)

---

### 11. **LayoutConfig** (`layoutconfigs`)
**Purpose**: Store layout configuration (singleton)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leftBarContent` | [Object] | ✅ | Array of left bar items |
| `leftBarContent[].title` | String | ✅ | Item title |
| `leftBarContent[].link` | String | ✅ | Item link |
| `leftBarContent[].imageUrl` | String | ❌ | Item image URL |
| `leftBarContent[].order` | Number | ❌ | Display order |
| `rightBarContent` | [Object] | ✅ | Array of right bar items |
| `rightBarContent[].title` | String | ✅ | Item title |
| `rightBarContent[].link` | String | ✅ | Item link |
| `rightBarContent[].imageUrl` | String | ❌ | Item image URL |
| `rightBarContent[].order` | Number | ❌ | Display order |
| `bottomStripText` | String | ✅ | Bottom strip text (default: `''`) |
| `bottomStripLink` | String | ❌ | Bottom strip link |
| `featuredBusinessIds` | [ObjectId] | ✅ | Array of Business references |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Static Method**: `getConfig()` - Returns single config document (creates if doesn't exist)

---

### 12. **OTP** (`otps`)
**Purpose**: Store OTP codes for authentication (auto-expires)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | ✅ | Email address |
| `otp` | String | ✅ | 6-digit OTP code |
| `type` | Enum | ✅ | `'signup'`, `'login'`, or `'reset'` (default: `'signup'`) |
| `expiresAt` | Date | ✅ | Expiration timestamp |
| `verified` | Boolean | ✅ | Verification status (default: `false`) |
| `createdAt` | Date | Auto | Creation timestamp |

**Indexes**: 
- `email` + `type` (compound)
- `expiresAt` (TTL index - auto-deletes expired documents)

---

## 🔗 Relationships

### One-to-Many:
- **Category** → **Business** (via `categoryId`)
- **Business** → **Offer** (via `businessId` in Offer)
- **Location** → **Banner** (via `locationId`)

### Many-to-Many:
- **Business** ↔ **Offer** (via `specialOffers` array in Business)
- **LayoutConfig** ↔ **Business** (via `featuredBusinessIds` array)

### References:
- `Business.categoryId` → `Category._id`
- `Business.specialOffers[]` → `Offer._id`
- `Offer.businessId` → `Business._id`
- `LayoutConfig.featuredBusinessIds[]` → `Business._id`
- `Banner.locationId` → `Location.id`

---

## 📍 Geospatial Data

### Models with Geospatial Support:
1. **Shop**: Uses `latitude` and `longitude` with geospatial index
2. **Business**: Uses GeoJSON `Point` with 2dsphere index for advanced queries
3. **Banner**: Uses `lat` and `lng` for distance calculation
4. **Category**: Optional `latitude` and `longitude`
5. **Location**: Optional `latitude` and `longitude`

### Geospatial Indexes:
- **Shop**: `{ latitude: 1, longitude: 1 }`
- **Business**: `{ location: '2dsphere' }` (for spherical distance calculations)

---

## 🔐 Security & Validation

### Password Hashing:
- **User** model uses `bcrypt` with salt rounds of 10
- Password is hashed automatically before saving
- Password field is excluded from queries by default (`select: false`)

### Email Validation:
- All email fields use regex: `/^\S+@\S+\.\S+$/`
- Emails are stored in lowercase

### Phone Validation:
- Phone numbers use regex: `/^\+?[1-9]\d{1,14}$/`

### Slug Validation:
- Slugs must be lowercase alphanumeric with hyphens: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`

---

## 📝 Notes

1. **Timestamps**: All models include `createdAt` and `updatedAt` (via `timestamps: true`)
2. **Auto-expiration**: OTP documents are automatically deleted after `expiresAt` using TTL index
3. **Singleton Models**: `DistanceConfig` and `LayoutConfig` are designed to have only one document
4. **Geospatial Queries**: Business model supports MongoDB geospatial queries using 2dsphere index
5. **Location Reference**: Banner uses `locationId` (string) to reference Location, not ObjectId

---

## 🗂️ Collection Summary

| Collection | Primary Purpose | Key Features |
|------------|----------------|--------------|
| `users` | Authentication | Password hashing, role-based access |
| `locations` | Location data | Pincode, area, coordinates |
| `banners` | Banner/shop images | Section-based, location-specific |
| `shops` | Shop information | Geospatial, ratings, offers |
| `categories` | Business categories | Slug-based routing |
| `businesses` | Business data | GeoJSON, category relationships |
| `offers` | Promotions | Date-based, business-linked |
| `pages` | Static content | SEO-friendly, publishable |
| `messages` | Contact forms | Status tracking |
| `distanceconfigs` | Distance settings | Singleton configuration |
| `layoutconfigs` | Layout settings | Singleton configuration |
| `otps` | Authentication | Auto-expiring OTP codes |

---

*Last Updated: Based on current codebase structure*

