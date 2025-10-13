#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 Asset Optimization Tips:');
console.log('');
console.log('1. Compress images:');
console.log('   - Use WebP format for better compression');
console.log('   - Optimize PNG/JPG files');
console.log('   - Remove unused images');
console.log('');
console.log('2. Font optimization:');
console.log('   - Use system fonts when possible');
console.log('   - Subset custom fonts to include only needed characters');
console.log('');
console.log('3. Icon optimization:');
console.log('   - Use vector icons (@expo/vector-icons) instead of image files');
console.log('   - Consider using emoji (as you already do) for game icons');

// Check for large assets
function checkAssetSizes() {
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) return;

  console.log('');
  console.log('📊 Checking asset sizes...');
  
  function checkDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        checkDir(fullPath, prefix + item + '/');
      } else {
        const sizeKB = Math.round(stat.size / 1024);
        if (sizeKB > 100) {
          console.log(`⚠️  Large file: ${prefix}${item} (${sizeKB}KB)`);
        }
      }
    });
  }
  
  checkDir(assetsDir);
}

checkAssetSizes();