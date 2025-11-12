# ✅ Production Deployment Checklist

Use this checklist before building and deploying your optimized APK.

---

## 📋 Pre-Build Checklist

### 1. Asset Optimization
- [ ] Run image optimization: `npm run optimize-images`
- [ ] Remove unused images from `assets/images/`
- [ ] Remove unused fonts from `assets/fonts/`
- [ ] Verify only essential assets in `app.config.js` assetBundlePatterns

### 2. Dependency Cleanup
- [ ] Check for unused dependencies: `npx depcheck`
- [ ] Remove unused packages: `npm uninstall <package>`
- [ ] Run `npm install` to clean up
- [ ] Verify `package.json` has only necessary dependencies

### 3. Configuration Verification
- [ ] Update version in `app.config.js` (currently: 1.0.2)
- [ ] Verify `NODE_ENV=production` in build scripts
- [ ] Check `android/gradle.properties` optimizations are enabled
- [ ] Verify `eas.json` production profile is configured

### 4. Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Remove console.log statements (or rely on Babel to remove them)
- [ ] Remove debugger statements
- [ ] Test app functionality in development mode

### 5. Build Configuration
- [ ] Verify Hermes is enabled (`hermesEnabled=true` in gradle.properties)
- [ ] Verify ProGuard is enabled (`android.enableProguardInReleaseBuilds=true`)
- [ ] Verify resource shrinking is enabled
- [ ] Verify architecture splitting is enabled

---

## 🔐 Security Checklist

### 1. Signing Key (IMPORTANT!)
- [ ] Generate production signing key (don't use debug keystore!)
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Store keystore file securely (backup in safe location)
- [ ] Update `android/app/build.gradle` with release signing config
- [ ] Never commit keystore to git (add to .gitignore)

### 2. Permissions
- [ ] Review permissions in `app.config.js`
- [ ] Remove unnecessary permissions
- [ ] Verify blockedPermissions list

### 3. API Keys & Secrets
- [ ] Remove hardcoded API keys
- [ ] Use environment variables for secrets
- [ ] Verify no sensitive data in code

---

## 🏗️ Build Process

### Option 1: EAS Build (Recommended)

#### Step 1: Optimize
```bash
npm run optimize-images
```

#### Step 2: Build
```bash
npm run build:production
```

#### Step 3: Wait
- Build takes ~10-15 minutes
- Monitor progress on EAS dashboard

#### Step 4: Download
- Download both APKs:
  - `app-armeabi-v7a-release.apk` (15-25 MB)
  - `app-arm64-v8a-release.apk` (18-30 MB)

### Option 2: Play Store AAB
```bash
npm run build:production-aab
```

### Option 3: Local Build
```bash
npm run build:local
```

---

## 🧪 Testing Checklist

### Before Deployment
- [ ] Install APK on real device (not emulator)
- [ ] Test on both architectures if possible
- [ ] Test all app features
- [ ] Test app startup time
- [ ] Test app performance
- [ ] Check for crashes
- [ ] Verify ProGuard didn't break functionality
- [ ] Test on different Android versions
- [ ] Test on low-end devices

### Performance Verification
- [ ] App starts quickly (< 3 seconds)
- [ ] No lag or stuttering
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Battery usage is reasonable

---

## 📊 Size Verification

### Check APK Size
```bash
# After local build
ls -lh android/app/build/outputs/apk/*/release/*.apk

# Expected sizes:
# armeabi-v7a: 15-25 MB
# arm64-v8a: 18-30 MB
```

### Analyze Bundle
```bash
npm run analyze-bundle
```

### Verify Optimization
- [ ] APK size is 60-70% smaller than before
- [ ] No unnecessary dependencies in bundle
- [ ] Assets are optimized
- [ ] JS bundle is minified

---

## 🚀 Deployment Checklist

### Google Play Store
- [ ] APK/AAB is signed with production key
- [ ] Version code is incremented
- [ ] Version name is updated
- [ ] App is tested on real devices
- [ ] Screenshots are updated
- [ ] Store listing is complete
- [ ] Privacy policy is updated (if needed)
- [ ] Release notes are written

### Direct Distribution
- [ ] APK is signed with production key
- [ ] APK is tested on target devices
- [ ] Distribution method is secure
- [ ] Users know which APK to download (architecture)

---

## 📝 Post-Deployment

### Monitoring
- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Monitor app performance metrics
- [ ] Monitor download/install success rate

### Documentation
- [ ] Update version in documentation
- [ ] Document any known issues
- [ ] Update changelog
- [ ] Notify users of new version

---

## 🐛 Troubleshooting

### Build Fails
```bash
npm run clean:build
npm run prebuild:clean
npm run build:production
```

### App Crashes
- Check ProGuard rules in `android/app/proguard-rules.pro`
- Add keep rules for classes that crash
- Test with local build first

### APK Too Large
```bash
npm run analyze-bundle
npx depcheck
```

---

## 📚 Quick Reference

### Build Commands
```bash
# Optimize images
npm run optimize-images

# Production APK
npm run build:production

# Play Store AAB
npm run build:production-aab

# Local build
npm run build:local

# Analyze bundle
npm run analyze-bundle

# Clean build
npm run clean:build
```

### Expected Results
- **APK Size**: 15-30 MB (60-70% reduction)
- **Startup Time**: 30-50% faster
- **JS Bundle**: 50% smaller

---

## ✅ Final Verification

Before deploying, verify:

- [ ] All checklist items above are completed
- [ ] App is tested on real devices
- [ ] APK size is optimized (15-30 MB)
- [ ] App performance is good
- [ ] No crashes or bugs
- [ ] Signed with production key
- [ ] Version is updated
- [ ] Ready for deployment

---

## 🎉 Ready to Deploy!

If all checklist items are complete, you're ready to deploy your optimized app!

**Final command:**
```bash
npm run optimize-images && npm run build:production
```

**Good luck with your deployment! 🚀**
