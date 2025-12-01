import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Business from '@/models/Business';
import Category from '@/models/Category';
import { extractAreaFromAddress, generateBusinessSlug } from '@/app/utils/businessUtils';
import fs from 'fs';
import path from 'path';

// Mapping of JSON filenames to category slugs
const JSON_TO_CATEGORY_MAP: Record<string, string> = {
  'Restaurants.json': 'restaurants',
  'Hotel.json': 'hotels',
  'beautyspa.json': 'beauty-spa',
  'Home-Decor.json': 'home-decor',
  'Wedding-Planning.json': 'wedding-planning',
  'Education.json': 'education',
  'Rent.json': 'rent-hire',
  'Hospitals.json': 'hospitals',
  'contractor.json': 'contractors',
  'Pet.json': 'pet-shops',
  'Pg.json': 'pg-hostels',
  'Estate-Agent.json': 'estate-agent',
  'dentists.json': 'dentists',
  'Gym.json': 'gym',
  'Loans.json': 'loans',
  'Event-Organisers.json': 'event-organisers',
  'Driving -Schools.json': 'driving-schools',
  'Packers.json': 'packers-movers',
  'courier_service.json': 'courier-service',
};

interface JsonBusiness {
  name: string;
  address: string;
  pincode: string;
}

/**
 * Auto-import endpoint - can be called automatically
 * Checks if businesses exist before importing
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if businesses already exist
    const existingBusinessCount = await Business.countDocuments();
    if (existingBusinessCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Businesses already exist in database',
        count: existingBusinessCount,
        imported: 0,
      });
    }

    const appDir = path.join(process.cwd(), 'app');
    const results: Record<string, any> = {};
    let totalImported = 0;

    // Process each JSON file
    for (const [fileName, categorySlug] of Object.entries(JSON_TO_CATEGORY_MAP)) {
      const jsonFilePath = path.join(appDir, fileName);
      
      if (!fs.existsSync(jsonFilePath)) {
        results[categorySlug] = { error: `File not found: ${fileName}` };
        continue;
      }

      try {
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) {
          results[categorySlug] = { error: `Category not found: ${categorySlug}` };
          continue;
        }

        const fileContent = fs.readFileSync(jsonFilePath, 'utf-8');
        const businesses: JsonBusiness[] = JSON.parse(fileContent);

        // Get existing slugs to avoid duplicates
        const existingBusinesses = await Business.find({ categoryId: category._id });
        const existingSlugs = new Set(existingBusinesses.map(b => b.slug));

        let imported = 0;
        let skipped = 0;

        for (const business of businesses) {
          try {
            // Check if business already exists
            const existingBusiness = existingBusinesses.find(
              b => b.name.toLowerCase() === business.name.toLowerCase() && 
                   b.address.toLowerCase() === business.address.toLowerCase()
            );

            if (existingBusiness) {
              skipped++;
              continue;
            }

            // Generate slug
            const slug = generateBusinessSlug(business.name, existingSlugs);
            existingSlugs.add(slug);

            // Extract area from address
            const area = extractAreaFromAddress(business.address);

            // Prepare business data
            const businessData: any = {
              name: business.name.trim(),
              slug,
              categoryId: category._id,
              address: business.address.trim(),
              pincode: (business.pincode?.trim() || '').replace(/\D+/g, '').slice(0, 6) || '',
              area: area,
              isFeatured: false,
            };

            // Create new business
            await Business.create(businessData);
            imported++;
          } catch (error: any) {
            console.error(`Error importing ${business.name}:`, error.message);
          }
        }

        totalImported += imported;
        results[categorySlug] = {
          success: true,
          imported,
          skipped,
          total: businesses.length,
        };
      } catch (error: any) {
        results[categorySlug] = { error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-import completed: ${totalImported} businesses imported`,
      imported: totalImported,
      results,
    });
  } catch (error: any) {
    console.error('Auto-import error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-import businesses', details: error.message },
      { status: 500 }
    );
  }
}

