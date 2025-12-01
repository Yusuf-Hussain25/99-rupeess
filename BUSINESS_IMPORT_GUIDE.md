# Business Import Guide

This guide explains how to import businesses from JSON files into the database.

## Overview

The import system reads JSON files containing business data (name, address, pincode) and saves them to the MongoDB database, automatically:
- Generating unique slugs for each business
- Extracting area information from addresses
- Mapping businesses to their respective categories
- Handling duplicates (skips existing businesses unless overwrite is enabled)

## JSON File Format

Each JSON file should contain an array of business objects:

```json
[
  {
    "name": "Business Name",
    "address": "Full address, Patna, Bihar",
    "pincode": "800001"
  }
]
```

## Category Mapping

The following JSON files are automatically mapped to categories:

| JSON File | Category Slug |
|-----------|--------------|
| `Restaurants.json` | `restaurants` |
| `Hotel.json` | `hotels` |
| `beautyspa.json` | `beauty-spa` |
| `Home-Decor.json` | `home-decor` |
| `Wedding-Planning.json` | `wedding-planning` |
| `Education.json` | `education` |
| `Rent.json` | `rent-hire` |
| `Hospitals.json` | `hospitals` |
| `contractor.json` | `contractors` |
| `Pet.json` | `pet-shops` |
| `Pg.json` | `pg-hostels` |
| `Estate-Agent.json` | `estate-agent` |
| `dentists.json` | `dentists` |
| `Gym.json` | `gym` |
| `Loans.json` | `loans` |
| `Event-Organisers.json` | `event-organisers` |
| `Driving -Schools.json` | `driving-schools` |
| `Packers.json` | `packers-movers` |
| `courier_service.json` | `courier-service` |

## API Endpoints

### Import Single Category

**POST** `/api/admin/businesses/import`

Import businesses from a specific JSON file.

**Request Body:**
```json
{
  "categorySlug": "restaurants",
  "fileName": "Restaurants.json",
  "overwrite": false
}
```

**Parameters:**
- `categorySlug` (optional): The category slug to import to. If not provided, will be inferred from `fileName`.
- `fileName` (optional): The JSON file name. If not provided, will try to find based on `categorySlug`.
- `overwrite` (optional, default: `false`): If `true`, updates existing businesses with the same name and address.

**Response:**
```json
{
  "success": true,
  "category": "restaurants",
  "imported": 20,
  "skipped": 5,
  "total": 25,
  "errors": []
}
```

### Import All Categories

**PUT** `/api/admin/businesses/import`

Import businesses from all JSON files at once.

**Request Body:**
```json
{
  "overwrite": false
}
```

**Parameters:**
- `overwrite` (optional, default: `false`): If `true`, updates existing businesses.

**Response:**
```json
{
  "success": true,
  "results": {
    "restaurants": {
      "success": true,
      "imported": 20,
      "skipped": 5,
      "total": 25
    },
    "hotels": {
      "success": true,
      "imported": 18,
      "skipped": 0,
      "total": 18
    }
  }
}
```

## Usage Examples

### Using cURL

**Import single category:**
```bash
curl -X POST http://localhost:3000/api/admin/businesses/import \
  -H "Content-Type: application/json" \
  -d '{
    "categorySlug": "restaurants",
    "fileName": "Restaurants.json"
  }'
```

**Import all categories:**
```bash
curl -X PUT http://localhost:3000/api/admin/businesses/import \
  -H "Content-Type: application/json" \
  -d '{
    "overwrite": false
  }'
```

### Using JavaScript/TypeScript

```typescript
// Import single category
const response = await fetch('/api/admin/businesses/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    categorySlug: 'restaurants',
    fileName: 'Restaurants.json',
    overwrite: false
  })
});

const result = await response.json();
console.log(result);

// Import all categories
const bulkResponse = await fetch('/api/admin/businesses/import', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ overwrite: false })
});

const bulkResult = await bulkResponse.json();
console.log(bulkResult);
```

## How It Works

1. **Slug Generation**: Each business name is converted to a URL-friendly slug (e.g., "Royal Wedding Planners" → "royal-wedding-planners")
2. **Duplicate Detection**: The system checks if a business with the same name and address already exists
3. **Area Extraction**: The area is extracted from the address (first meaningful location part)
4. **Pincode Cleaning**: Pincodes are cleaned to contain only digits (max 6 digits)
5. **Category Linking**: Businesses are linked to their category using the category ID

## Notes

- Businesses are **not** set as featured by default
- Empty pincodes are allowed but will be stored as empty strings
- The system automatically handles duplicate slugs by appending numbers (e.g., `business-name-1`, `business-name-2`)
- If a category doesn't exist in the database, the import will fail for that category
- JSON files should be located in the `app/` directory

## Troubleshooting

**Error: "Category not found"**
- Ensure the category exists in the database with the correct slug
- Check the category mapping table above

**Error: "File not found"**
- Ensure the JSON file exists in the `app/` directory
- Check the filename matches exactly (case-sensitive)

**Businesses not importing**
- Check MongoDB connection
- Verify category exists in database
- Check JSON file format is correct
- Review error messages in the response

