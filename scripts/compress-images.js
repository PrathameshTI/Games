const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ASSETS_DIR = path.join(__dirname, '../assets/images');
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

function compressImages() {
  console.log('🖼️  Compressing images...');
  
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      console.log('Installing sharp for image compression...');
      execSync('npm install --save-dev sharp', { stdio: 'inherit' });
    }

    const sharp = require('sharp');
    
    function processDirectory(dir) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          processDirectory(filePath);
        } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
          const fileSize = stat.size;
          
          if (fileSize > MAX_IMAGE_SIZE) {
            console.log(`Compressing ${file} (${(fileSize / 1024).toFixed(2)} KB)`);
            
            const tempPath = filePath + '.tmp';
            
            sharp(filePath)
              .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 80, progressive: true })
              .png({ quality: 80, compressionLevel: 9 })
              .toFile(tempPath)
              .then(() => {
                fs.renameSync(tempPath, filePath);
                const newSize = fs.statSync(filePath).size;
                console.log(`✓ Compressed to ${(newSize / 1024).toFixed(2)} KB`);
              })
              .catch(err => {
                console.error(`Error compressing ${file}:`, err);
                if (fs.existsSync(tempPath)) {
                  fs.unlinkSync(tempPath);
                }
              });
          }
        }
      });
    }
    
    if (fs.existsSync(ASSETS_DIR)) {
      processDirectory(ASSETS_DIR);
      console.log('✅ Image compression complete');
    } else {
      console.log('No assets/images directory found');
    }
  } catch (error) {
    console.error('Error during image compression:', error);
  }
}

compressImages();
