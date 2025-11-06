#!/usr/bin/env node

/**
 * PWA Diagnostic Script
 * Checks all PWA configurations and reports issues
 */

const fs = require('fs');
const path = require('path');

const baseDir = __dirname;

console.log('\n🔍 Govigi PWA Diagnostic Report\n');
console.log('=' .repeat(60));

let allGood = true;

// Check 1: Manifest.json exists
console.log('\n1️⃣  Checking manifest.json...');
const manifestPath = path.join(baseDir, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log('   ✅ manifest.json found and valid');
    console.log(`   📱 App Name: ${manifest.name}`);
    console.log(`   🏷️  Display: ${manifest.display}`);
    console.log(`   🎨 Theme Color: ${manifest.theme_color}`);
    console.log(`   🖼️  Icons: ${manifest.icons.length} icon(s)`);
  } catch (err) {
    console.log('   ❌ manifest.json is invalid:', err.message);
    allGood = false;
  }
} else {
  console.log('   ❌ manifest.json NOT FOUND');
  allGood = false;
}

// Check 2: Service Worker exists
console.log('\n2️⃣  Checking service worker...');
const swPath = path.join(baseDir, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  const swSize = fs.statSync(swPath).size;
  console.log('   ✅ sw.js found');
  console.log(`   📦 Size: ${swSize} bytes`);
} else {
  console.log('   ❌ sw.js NOT FOUND');
  allGood = false;
}

// Check 3: Icons exist
console.log('\n3️⃣  Checking icons...');
const iconFiles = ['icon-192.png', 'icon-512.png', 'icon-192-maskable.png', 'icon-512-maskable.png'];
let iconsOk = true;
iconFiles.forEach(icon => {
  const iconPath = path.join(baseDir, 'public', icon);
  if (fs.existsSync(iconPath)) {
    const size = fs.statSync(iconPath).size;
    console.log(`   ✅ ${icon} (${size} bytes)`);
  } else {
    console.log(`   ❌ ${icon} NOT FOUND`);
    iconsOk = false;
    allGood = false;
  }
});

// Check 4: Layout has manifest link
console.log('\n4️⃣  Checking layout.tsx...');
const layoutPath = path.join(baseDir, 'src', 'app', 'layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const hasManifest = layoutContent.includes('rel="manifest"');
  const hasViewport = layoutContent.includes('name="viewport"');
  const hasThemeColor = layoutContent.includes('name="theme-color"');
  const hasServiceWorkerReg = layoutContent.includes('ServiceWorkerRegister');
  
  if (hasManifest && hasViewport && hasThemeColor && hasServiceWorkerReg) {
    console.log('   ✅ Manifest link present');
    console.log('   ✅ Viewport meta tag present');
    console.log('   ✅ Theme color meta tag present');
    console.log('   ✅ ServiceWorkerRegister component present');
  } else {
    if (!hasManifest) console.log('   ❌ Manifest link missing');
    if (!hasViewport) console.log('   ❌ Viewport meta tag missing');
    if (!hasThemeColor) console.log('   ❌ Theme color meta tag missing');
    if (!hasServiceWorkerReg) console.log('   ❌ ServiceWorkerRegister component missing');
    allGood = false;
  }
} else {
  console.log('   ❌ layout.tsx NOT FOUND');
  allGood = false;
}

// Check 5: ServiceWorkerRegister component
console.log('\n5️⃣  Checking ServiceWorkerRegister component...');
const swRegPath = path.join(baseDir, 'src', 'components', 'core', 'ServiceWorkerRegister.tsx');
if (fs.existsSync(swRegPath)) {
  console.log('   ✅ ServiceWorkerRegister.tsx found');
} else {
  console.log('   ❌ ServiceWorkerRegister.tsx NOT FOUND');
  allGood = false;
}

// Check 6: Next.js config
console.log('\n6️⃣  Checking next.config.mjs...');
const nextConfigPath = path.join(baseDir, 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
  const hasHeaders = nextConfigContent.includes('async headers()');
  const hasManifestHeader = nextConfigContent.includes('manifest.json');
  const hasServiceWorkerHeader = nextConfigContent.includes('Service-Worker-Allowed');
  
  if (hasHeaders && hasManifestHeader && hasServiceWorkerHeader) {
    console.log('   ✅ Headers configuration present');
    console.log('   ✅ Manifest headers configured');
    console.log('   ✅ Service Worker headers configured');
  } else {
    if (!hasHeaders) console.log('   ❌ Headers configuration missing');
    if (!hasManifestHeader) console.log('   ❌ Manifest headers missing');
    if (!hasServiceWorkerHeader) console.log('   ❌ Service Worker headers missing');
    allGood = false;
  }
} else {
  console.log('   ❌ next.config.mjs NOT FOUND');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 DIAGNOSTIC SUMMARY\n');

if (allGood) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nYour PWA is properly configured.\n');
  console.log('📱 To test installation:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Visit: http://localhost:3001/pwa-debug');
  console.log('   3. Check browser console for PWA status\n');
  console.log('🚀 For production deployment:');
  console.log('   • Ensure HTTPS is enabled');
  console.log('   • All PWA files are publicly accessible');
  console.log('   • Test on mobile device (2-3 visits for prompt)\n');
} else {
  console.log('⚠️  SOME ISSUES FOUND');
  console.log('\nPlease fix the issues listed above.\n');
  process.exit(1);
}

console.log('='.repeat(60) + '\n');
