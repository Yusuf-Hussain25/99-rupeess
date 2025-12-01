/**
 * Automatic import script that runs on server startup
 * This will import all businesses from JSON files if they don't exist in the database
 */

import mongoose from 'mongoose';
import Business from '../models/Business';
import Category from '../models/Category';
import { extractAreaFromAddress, generateBusinessSlug } from '../app/utils/businessUtils';
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

let isImporting = false;
let importPromise: Promise<void> | null = null;

export async function autoImportBusinesses() {
  // Prevent multiple simultaneous imports
  if (isImporting && importPromise) {
    return importPromise;
  }

  isImporting = true;
  importPromise = (async () => {
    try {
      const MONGODB_URI = process.env.MONGODB_URI;
      if (!MONGODB_URI) {
        console.log('⚠️  MONGODB_URI not set, skipping auto-import');
        return;
      }

      // Check if already connected
      if (mongoose.connection.readyState !== 1) {
        console.log('🔌 Connecting to MongoDB for auto-import...');
        await mongoose.connect(MONGODB_URI);
      }

      // Check if businesses already exist
      const existingBusinessCount = await Business.countDocuments();
      if (existingBusinessCount > 0) {
        console.log(`✅ ${existingBusinessCount} businesses already exist. Skipping auto-import.`);
        console.log('   Use the admin panel or npm run import-businesses to re-import.');
        return;
      }

      console.log('🚀 Starting automatic business import...');
      const appDir = path.join(process.cwd(), 'app');
      let totalImported = 0;
      let totalSkipped = 0;

      // Process each JSON file
      for (const [fileName, categorySlug] of Object.entries(JSON_TO_CATEGORY_MAP)) {
        const jsonFilePath = path.join(appDir, fileName);
        
        if (!fs.existsSync(jsonFilePath)) {
          console.log(`⚠️  File not found: ${fileName}`);
          continue;
        }

        try {
          const category = await Category.findOne({ slug: categorySlug });
          if (!category) {
            console.log(`⚠️  Category not found: ${categorySlug}`);
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
              console.error(`   ❌ Error importing ${business.name}: ${error.message}`);
            }
          }

          totalImported += imported;
          totalSkipped += skipped;

          if (imported > 0) {
            console.log(`   ✅ ${categorySlug}: ${imported} businesses imported`);
          }
        } catch (error: any) {
          console.error(`   ❌ Error processing ${fileName}: ${error.message}`);
        }
      }

      if (totalImported > 0) {
        console.log(`\n✅ Auto-import completed: ${totalImported} businesses imported, ${totalSkipped} skipped`);
      } else if (totalSkipped > 0) {
        console.log(`\n✅ All businesses already exist (${totalSkipped} skipped)`);
      }
    } catch (error: any) {
      console.error('❌ Auto-import error:', error.message);
    } finally {
      isImporting = false;
    }
  })();

  return importPromise;
}

// Auto-run on module load (only in server environment)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Run after a short delay to ensure MongoDB connection is ready
  setTimeout(() => {
    autoImportBusinesses().catch(console.error);
  }, 2000);
}

