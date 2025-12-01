/**
 * Standalone script to import all businesses from JSON files
 * Run with: npm run import-businesses
 */

import mongoose from 'mongoose';
import Business from '../models/Business';
import Category from '../models/Category';
import { slugify, extractAreaFromAddress, generateBusinessSlug } from '../app/utils/businessUtils';
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

async function importBusinesses() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const appDir = path.join(process.cwd(), 'app');
    const results: Record<string, any> = {};
    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Process each JSON file
    for (const [fileName, categorySlug] of Object.entries(JSON_TO_CATEGORY_MAP)) {
      const jsonFilePath = path.join(appDir, fileName);
      
      if (!fs.existsSync(jsonFilePath)) {
        console.log(`⚠️  File not found: ${fileName}`);
        results[categorySlug] = { error: `File not found: ${fileName}` };
        continue;
      }

      try {
        console.log(`\n📂 Processing ${fileName} (${categorySlug})...`);
        
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) {
          console.log(`❌ Category not found: ${categorySlug}`);
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
        let errors: string[] = [];

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
            errors.push(`${business.name}: ${error.message}`);
            totalErrors++;
          }
        }

        totalImported += imported;
        totalSkipped += skipped;

        console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors.length}`);
        
        if (errors.length > 0) {
          console.log(`   ⚠️  First few errors:`);
          errors.slice(0, 3).forEach(err => console.log(`      - ${err}`));
        }

        results[categorySlug] = {
          success: true,
          imported,
          skipped,
          total: businesses.length,
          errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        };
      } catch (error: any) {
        console.log(`   ❌ Error processing ${fileName}: ${error.message}`);
        results[categorySlug] = { error: error.message };
        totalErrors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary');
    console.log('='.repeat(60));
    console.log(`✅ Total Imported: ${totalImported}`);
    console.log(`⏭️  Total Skipped: ${totalSkipped}`);
    console.log(`❌ Total Errors: ${totalErrors}`);
    console.log('='.repeat(60));

    // Print category-wise summary
    console.log('\n📋 Category-wise Results:');
    for (const [categorySlug, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`   ${categorySlug}: ${result.imported} imported, ${result.skipped} skipped`);
      } else {
        console.log(`   ${categorySlug}: ❌ ${result.error}`);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Import completed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

// Run the import
importBusinesses();

