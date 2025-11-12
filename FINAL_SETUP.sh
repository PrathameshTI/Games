#!/bin/bash

echo "🚀 Setting up optimized Expo build environment..."

# Step 1: Clean everything
echo "📦 Cleaning build artifacts..."
rm -rf node_modules
rm -rf android/app/build
rm -rf android/.gradle
rm -rf .expo
rm -rf ios/build
rm -f package-lock.json

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
npm install

# Step 3: Install dev dependencies for optimization
echo "🔧 Installing optimization tools..."
npm install --save-dev babel-plugin-transform-remove-console babel-plugin-transform-inline-environment-variables sharp

# Step 4: Compress images
echo "🖼️  Compressing images..."
node scripts/compress-images.js

# Step 5: Prebuild Android
echo "🏗️  Generating native Android code..."
npx expo prebuild --clean --platform android

# Step 6: Verify configuration
echo "✅ Verifying Hermes is enabled..."
npx react-native info | grep -i hermes

echo ""
echo "✨ Setup complete! Ready to build."
echo ""
echo "📱 To build production APK, run:"
echo "   npm run build:production"
echo ""
echo "📊 To analyze bundle size, run:"
echo "   npm run analyze-bundle"
echo ""
echo "🏪 To build AAB for Play Store, run:"
echo "   npm run build:production-aab"
echo ""
