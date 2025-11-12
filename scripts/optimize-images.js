#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const QUALITY = 80; // Quality for JPEG/WebP compression

async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    console.log(`Optimizing ${fileName}...`);
    
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    if (ext === '.png') {
      // Optimize PNG with compression
      await image
        .png({
          quality: QUALITY,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: true,
        })
        .toFile(filePath + '.tmp');
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // Optimize JPEG
      await image
        .jpeg({
          quality: QUALITY,
          progressive: true,
          mozjpeg: true,
        })
        .toFile(filePath + '.tmp');
    } else {
      console.log(`Skipping ${fileName} (unsupported format)`);
      return;
    }
    
    // Replace original with optimized version
    fs.renameSync(filePath + '.tmp', filePath);
    console.log(`✓ Optimized ${fileName}`);
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
  }
}

async function optimizeAllImages() {
  console.log('Starting image optimization...\n');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('Assets directory not found!');
    process.exit(1);
  }
  
  const files = fs.readdirSync(ASSETS_DIR);
  
  for (const file of files) {
    const filePath = path.join(ASSETS_DIR, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && /\.(png|jpg|jpeg)$/i.test(file)) {
      await optimizeImage(filePath);
    }
  }
  
  console.log('\n✓ All images optimized!');
}

optimizeAllImages().catch(console.error);
