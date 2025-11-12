# Production Build Instructions - Optimized for Minimal APK Size

## Prerequisites
```bash
npm install -g eas-cli
eas login
```

## Step 1: Clean Build Environment
```bash
npm run clean
```

## Step 2: Compress Images (Optional but Recommended)
```bash
npm run optimize-assets
node scripts/compress-images.js
```

## Step 3: Install Dependencies
```bash
npm install --production=false
```

## Step 4: Prebuild (Generate Native Code)
```bash
npx expo prebuild --clean --platform android
```

## Step 5: Build Production APK
```bash
# For smallest APK (recommended)
npm run build:production

# Or use EAS directly
eas build --platform android --profile production --local
```

## Step 6: Build AAB for Play Store (Optional)
```bash
npm run build:production-aab
```

## Analyze Bundle Size
```bash
npm run analyze-bundle
```

## Local Build (Without EAS)
```bash
# Prebuild
npx expo prebuild --clean --platform android

# Build locally
cd android
./gradlew assembleRelease

# APK location: android/app/build/outputs/apk/release/
```

## Optimization Checklist
- ✅ Hermes engine enabled
- ✅ ProGuard/R8 enabled with aggressive rules
- ✅ Separate builds per CPU architecture
- ✅ Resource shrinking enabled
- ✅ Console logs removed in production
- ✅ Unused permissions blocked
- ✅ PNG crunching enabled
- ✅ Code obfuscation enabled
- ✅ Tree shaking configured
- ✅ Lazy loading for game screens
- ✅ Asset bundle patterns restricted
- ✅ Only English resources included

## Expected APK Sizes
- arm64-v8a: ~15-25 MB
- armeabi-v7a: ~12-20 MB

## Troubleshooting

### Build fails with memory error
```bash
export GRADLE_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=512m"
```

### Clear all caches
```bash
rm -rf node_modules
rm -rf android/app/build
rm -rf .expo
npm install
```

### Verify Hermes is enabled
```bash
npx react-native info
```

## Production Deployment
1. Test APK on multiple devices
2. Check app size in Play Console
3. Enable Android App Bundle for dynamic delivery
4. Monitor crash reports after release
