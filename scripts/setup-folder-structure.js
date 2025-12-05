#!/usr/bin/env node

/**
 * Script to set up industry-standard folder structure
 * Run: node scripts/setup-folder-structure.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Directory structure to create
const directories = [
  // Data directories
  'data/categories',
  'data/locations',
  'data/mock',
  
  // Shared directories
  'src/shared/components/ui',
  'src/shared/components/layout',
  'src/shared/components/feedback',
  'src/shared/hooks',
  'src/shared/utils',
  'src/shared/lib',
  'src/shared/types',
  
  // Feature directories (basic structure)
  'src/features/admin/components',
  'src/features/admin/hooks',
  'src/features/admin/services',
  'src/features/admin/types',
  
  'src/features/auth/components',
  'src/features/auth/hooks',
  'src/features/auth/services',
  'src/features/auth/types',
  
  'src/features/business/components',
  'src/features/business/hooks',
  'src/features/business/services',
  'src/features/business/types',
  
  'src/features/category/components',
  'src/features/category/hooks',
  'src/features/category/services',
  'src/features/category/types',
  
  'src/features/location/components',
  'src/features/location/hooks',
  'src/features/location/services',
  'src/features/location/types',
  
  'src/features/shop-image/components',
  'src/features/shop-image/hooks',
  'src/features/shop-image/services',
  'src/features/shop-image/types',
  
  'src/features/offer/components',
  'src/features/offer/hooks',
  'src/features/offer/services',
  'src/features/offer/types',
  
  // Contexts
  'src/contexts',
  
  // Config
  'src/config',
  
  // Tests
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  
  // Docs
  'docs',
];

// JSON files mapping (from app/ to data/categories/)
const jsonFilesMapping = {
  'app/beautyspa.json': 'data/categories/beauty-spa.json',
  'app/contractor.json': 'data/categories/contractors.json',
  'app/courier_service.json': 'data/categories/courier-service.json',
  'app/dentists.json': 'data/categories/dentists.json',
  'app/Driving -Schools.json': 'data/categories/driving-schools.json',
  'app/Education.json': 'data/categories/education.json',
  'app/Estate-Agent.json': 'data/categories/estate-agent.json',
  'app/Event-Organisers.json': 'data/categories/event-organisers.json',
  'app/Gym.json': 'data/categories/gym.json',
  'app/Home-Decor.json': 'data/categories/home-decor.json',
  'app/Hospitals.json': 'data/categories/hospitals.json',
  'app/Hotel.json': 'data/categories/hotels.json',
  'app/Loans.json': 'data/categories/loans.json',
  'app/Packers.json': 'data/categories/packers-movers.json',
  'app/Pet.json': 'data/categories/pet-shops.json',
  'app/Pg.json': 'data/categories/pg-hostels.json',
  'app/Rent.json': 'data/categories/rent-hire.json',
  'app/Restaurants.json': 'data/categories/restaurants.json',
  'app/Wedding-Planning.json': 'data/categories/wedding-planning.json',
  'app/shop.json': 'data/categories/shop.json',
};

// Other files to move
const otherFilesMapping = {
  'app/patna_full_locations.json': 'data/locations/patna_full_locations.json',
  'app/data/mockShops.ts': 'data/mock/mockShops.ts',
};

function createDirectories() {
  console.log('📁 Creating directory structure...');
  
  directories.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✓ Created: ${dir}`);
    } else {
      console.log(`  ⊙ Exists: ${dir}`);
    }
  });
  
  console.log('✅ Directory structure created!\n');
}

function moveJsonFiles() {
  console.log('📦 Moving JSON files to data/categories/...');
  
  let moved = 0;
  let skipped = 0;
  
  Object.entries(jsonFilesMapping).forEach(([source, dest]) => {
    const sourcePath = path.join(rootDir, source);
    const destPath = path.join(rootDir, dest);
    
    if (fs.existsSync(sourcePath)) {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ Moved: ${source} → ${dest}`);
      moved++;
    } else {
      console.log(`  ⊙ Skipped (not found): ${source}`);
      skipped++;
    }
  });
  
  console.log(`\n✅ Moved ${moved} files, skipped ${skipped}\n`);
}

function moveOtherFiles() {
  console.log('📦 Moving other data files...');
  
  Object.entries(otherFilesMapping).forEach(([source, dest]) => {
    const sourcePath = path.join(rootDir, source);
    const destPath = path.join(rootDir, dest);
    
    if (fs.existsSync(sourcePath)) {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✓ Moved: ${source} → ${dest}`);
    } else {
      console.log(`  ⊙ Skipped (not found): ${source}`);
    }
  });
  
  console.log('✅ Other files moved!\n');
}

function createReadmeFiles() {
  console.log('📝 Creating README files...');
  
  const readmes = {
    'src/shared/README.md': `# Shared Components and Utilities

This directory contains reusable components, hooks, utilities, and types that are used across multiple features.

## Structure
- \`components/\` - Reusable UI components
- \`hooks/\` - Shared React hooks
- \`utils/\` - Utility functions
- \`lib/\` - Library configurations
- \`types/\` - Shared TypeScript types
`,
    'src/features/README.md': `# Features

This directory contains feature-based modules following Domain-Driven Design principles.

Each feature is self-contained with:
- \`components/\` - Feature-specific components
- \`hooks/\` - Feature-specific hooks
- \`services/\` - API calls and business logic
- \`types/\` - Feature-specific types

## Features
- \`admin/\` - Admin panel functionality
- \`auth/\` - Authentication
- \`business/\` - Business listings
- \`category/\` - Category pages
- \`location/\` - Location management
- \`shop-image/\` - Shop image management (formerly banners)
- \`offer/\` - Offers and deals
`,
    'data/README.md': `# Data Files

This directory contains all static data files.

## Structure
- \`categories/\` - Category JSON data files
- \`locations/\` - Location data files
- \`mock/\` - Mock data for testing
`,
  };
  
  Object.entries(readmes).forEach(([filePath, content]) => {
    const fullPath = path.join(rootDir, filePath);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      console.log(`  ✓ Created: ${filePath}`);
    }
  });
  
  console.log('✅ README files created!\n');
}

function main() {
  console.log('🚀 Setting up industry-standard folder structure...\n');
  
  createDirectories();
  moveJsonFiles();
  moveOtherFiles();
  createReadmeFiles();
  
  console.log('✨ Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update tsconfig.json with path aliases (see MIGRATION_GUIDE.md)');
  console.log('2. Start migrating components gradually');
  console.log('3. Update imports as you migrate');
  console.log('\n⚠️  Note: Original files are copied, not moved. Review and delete originals after testing.');
}

if (require.main === module) {
  main();
}

module.exports = { createDirectories, moveJsonFiles, moveOtherFiles };


