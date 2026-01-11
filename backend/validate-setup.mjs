#!/usr/bin/env node

/**
 * Configuration Validator for Odyssey Next.js Backend
 * Run: node validate-setup.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating Odyssey Next.js Backend Setup\n');
console.log('='.repeat(60));

let allGood = true;
const issues = [];
const warnings = [];

// Check 1: .env.local exists
console.log('\n📄 Checking environment file...');
const envPath = join(__dirname, '.env.local');

if (!existsSync(envPath)) {
  console.log('  ❌ .env.local NOT FOUND');
  issues.push('Create .env.local file in nextjs-backend/');
  allGood = false;
} else {
  console.log('  ✅ .env.local exists');
  
  const envContent = readFileSync(envPath, 'utf-8');
  
  // Check Publishable Key
  if (envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')) {
    const match = envContent.match(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)/);
    if (match) {
      const key = match[1].trim();
      if (key === 'YOUR_PUBLISHABLE_KEY' || key === '') {
        console.log('  ❌ Clerk Publishable Key not configured');
        issues.push('Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local');
        allGood = false;
      } else if (key.startsWith('pk_test_') || key.startsWith('pk_live_')) {
        console.log(`  ✅ Clerk Publishable Key configured`);
      } else {
        console.log('  ⚠️  Publishable Key format seems incorrect');
        warnings.push('Verify Clerk Publishable Key format (should start with pk_)');
      }
    }
  } else {
    console.log('  ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing');
    issues.push('Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local');
    allGood = false;
  }
  
  // Check Secret Key
  if (envContent.includes('CLERK_SECRET_KEY')) {
    const match = envContent.match(/CLERK_SECRET_KEY=(.+)/);
    if (match) {
      const key = match[1].trim();
      if (key === 'YOUR_CLERK_SECRET_KEY_HERE' || key === 'YOUR_SECRET_KEY' || key === '') {
        console.log('  ❌ Clerk Secret Key not configured');
        issues.push('Add CLERK_SECRET_KEY to .env.local from Clerk Dashboard');
        allGood = false;
      } else if (key.startsWith('sk_test_') || key.startsWith('sk_live_')) {
        console.log(`  ✅ Clerk Secret Key configured`);
      } else {
        console.log('  ⚠️  Secret Key format seems incorrect');
        warnings.push('Verify Clerk Secret Key format (should start with sk_)');
      }
    }
  } else {
    console.log('  ❌ CLERK_SECRET_KEY missing');
    issues.push('Add CLERK_SECRET_KEY to .env.local');
    allGood = false;
  }
  
  // Check MongoDB URI
  if (envContent.includes('MONGODB_URI')) {
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match) {
      const uri = match[1].trim();
      if (uri === 'YOUR_MONGODB_URI_HERE' || uri === 'YOUR_MONGODB_CONNECTION_STRING' || uri === '') {
        console.log('  ❌ MongoDB URI not configured');
        issues.push('Add MONGODB_URI to .env.local from MongoDB Atlas');
        allGood = false;
      } else if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
        console.log(`  ✅ MongoDB URI configured`);
        // Check for placeholder password
        if (uri.includes('<password>') || uri.includes('your_password')) {
          console.log('  ⚠️  MongoDB URI contains placeholder password');
          warnings.push('Replace <password> in MongoDB URI with actual password');
        }
      } else {
        console.log('  ⚠️  MongoDB URI format seems incorrect');
        warnings.push('Verify MongoDB URI format (should start with mongodb://)');
      }
    }
  } else {
    console.log('  ❌ MONGODB_URI missing');
    issues.push('Add MONGODB_URI to .env.local');
    allGood = false;
  }
}

// Check 2: node_modules exists
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = join(__dirname, 'node_modules');
if (existsSync(nodeModulesPath)) {
  console.log('  ✅ Dependencies installed');
  
  // Check for key packages
  const clerkPath = join(nodeModulesPath, '@clerk', 'nextjs');
  const mongoosePath = join(nodeModulesPath, 'mongoose');
  const nextPath = join(nodeModulesPath, 'next');
  
  if (!existsSync(clerkPath)) {
    console.log('  ⚠️  @clerk/nextjs not found');
    warnings.push('Run: npm install');
  }
  if (!existsSync(mongoosePath)) {
    console.log('  ⚠️  mongoose not found');
    warnings.push('Run: npm install');
  }
  if (!existsSync(nextPath)) {
    console.log('  ⚠️  next not found');
    warnings.push('Run: npm install');
  }
} else {
  console.log('  ❌ Dependencies not installed');
  issues.push('Run: npm install');
  allGood = false;
}

// Check 3: Required files exist
console.log('\n📁 Checking project structure...');
const requiredFiles = [
  'src/middleware.ts',
  'src/app/layout.tsx',
  'src/lib/mongodb.ts',
  'src/models/index.ts',
  'src/app/api/health/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/streaks/route.ts',
];

let filesGood = true;
for (const file of requiredFiles) {
  const filePath = join(__dirname, file);
  if (!existsSync(filePath)) {
    console.log(`  ❌ Missing: ${file}`);
    filesGood = false;
    allGood = false;
  }
}

if (filesGood) {
  console.log('  ✅ All required files present');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 VALIDATION SUMMARY\n');

if (allGood && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nYou can start the server:');
  console.log('  npm run dev');
  console.log('\nThen visit: http://localhost:5000');
} else {
  if (issues.length > 0) {
    console.log('❌ ISSUES FOUND:\n');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }
  
  console.log('\n📖 NEED HELP?');
  console.log('  - Read: QUICKSTART.md (3-step setup)');
  console.log('  - Read: SETUP_GUIDE.md (detailed guide)');
  console.log('  - Get Clerk keys: https://dashboard.clerk.com');
  console.log('  - Get MongoDB URI: https://mongodb.com/cloud/atlas');
}

console.log('\n' + '='.repeat(60) + '\n');

process.exit(allGood ? 0 : 1);
