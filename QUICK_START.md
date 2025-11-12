# Quick Start - Production Build

## One-Command Setup
```bash
./FINAL_SETUP.sh
```

## Manual Setup

### 1. Install Dependencies
```bash
npm install
npm install --save-dev babel-plugin-transform-remove-console babel-plugin-transform-inline-environment-variables sharp
```

### 2. Compress Assets
```bash
node scripts/compress-images.js
```

### 3. Build Production APK
```bash
# Using EAS (Recommended)
npm run build:production

# Or local build
npx expo prebuild --clean --platform android
cd android && ./gradlew assembleRelease
```

## APK Location
```
android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
android/app/build/outputs/apk/release/app-armeabi-v7a-release.apk
```

## Expected Size
- arm64-v8a: ~15-25 MB
- armeabi-v7a: ~12-20 MB

## Verify Optimization
```bash
# Check APK size
ls -lh android/app/build/outputs/apk/release/

# Analyze bundle
npm run analyze-bundle
```

## Install on Device
```bash
adb install android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

## Troubleshooting

### Build fails
```bash
npm run clean
npm install
npx expo prebuild --clean --platform android
```

### Out of memory
```bash
export GRADLE_OPTS="-Xmx4096m"
cd android && ./gradlew assembleRelease
```

### Hermes not enabled
Check `android/gradle.properties` has:
```
hermesEnabled=true
```

## All Optimizations Applied ✅
- Hermes engine
- ProGuard/R8 code shrinking
- Resource shrinking
- Separate APKs per architecture
- Console logs removed
- PNG compression
- Tree shaking
- Code obfuscation
- Minimal permissions
- Asset optimization
