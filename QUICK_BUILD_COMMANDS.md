# 🚀 Quick Build Commands

## Production Build (Smallest APK)

### Step 1: Optimize Assets
```bash
npm run optimize-images
```

### Step 2: Build with EAS (Recommended)
```bash
npm run build:production
```

**Output:** Two optimized APKs (15-30 MB each)
- `app-armeabi-v7a-release.apk` - For older devices
- `app-arm64-v8a-release.apk` - For modern devices

---

## Alternative: Build AAB for Play Store
```bash
npm run build:production-aab
```

**Output:** Single AAB file (20-35 MB) - Google Play optimizes further

---

## Alternative: Local Build
```bash
npm run build:local
```

**Output Location:**
```
android/app/build/outputs/apk/armeabi-v7a/release/app-armeabi-v7a-release.apk
android/app/build/outputs/apk/arm64-v8a/release/app-arm64-v8a-release.apk
```

---

## Analyze Bundle Size
```bash
npm run analyze-bundle
```

---

## Clean Build Cache
```bash
npm run clean:build
```

---

## 📊 Expected Results

| Build Type | Size | Best For |
|------------|------|----------|
| arm64-v8a APK | 18-30 MB | Modern devices (2016+) |
| armeabi-v7a APK | 15-25 MB | Older devices |
| AAB (Play Store) | 20-35 MB | Google Play Store |
| Universal APK (unoptimized) | 60-100+ MB | ❌ Not recommended |

**Size Reduction: ~60-70%**

---

## ✅ Pre-Build Checklist

- [ ] `npm run optimize-images`
- [ ] Remove unused dependencies
- [ ] Remove unused assets
- [ ] Set `NODE_ENV=production`
- [ ] Update version number

---

## 🎯 One-Line Production Build

```bash
npm run optimize-images && npm run build:production
```

**That's it! Your optimized APK will be ready in ~10-15 minutes.**
