# Android App Stuck on Welcome Screen - Troubleshooting Guide

## Problem: App gets stuck on welcome/splash screen on Android devices/emulators

### Most Common Causes:

## 1. **Permission Issues** ⚠️
The most common cause of apps getting stuck is denied permissions.

### Solution:
- Run the app and use the "Check Permissions" option from the Welcome screen
- Manually grant permissions in Android Settings:
  - Go to **Settings > Apps > CCSA FIMS > Permissions**
  - Enable **Camera** and **Location** permissions
  - Restart the app

### Required Permissions:
- `CAMERA` - For QR code scanning and photos
- `ACCESS_FINE_LOCATION` - For GPS coordinates
- `ACCESS_COARSE_LOCATION` - For approximate location
- `INTERNET` - For API calls
- `ACCESS_NETWORK_STATE` - For network status

## 2. **Firebase Auth Initialization** 🔥
Firebase authentication can cause Android-specific loading issues.

### Signs:
- App loads but stays on welcome screen
- No navigation happens when pressing buttons
- Firebase Auth warnings in logs

### Solution:
- AsyncStorage is now properly configured for Firebase persistence
- Check network connectivity
- Verify Firebase configuration variables are set

## 3. **Metro Bundler Issues** 📦
JavaScript bundle loading problems can cause the app to hang.

### Solution:
```bash
# Clear Metro cache
npx expo start --clear

# Reset npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules && npm install
```

## 4. **Android Emulator Issues** 📱
Emulator-specific problems that don't occur on real devices.

### Solution:
- Cold Boot the emulator: AVD Manager > Wipe Data
- Increase emulator RAM allocation (4GB+)
- Enable GPU acceleration
- Try different API levels (API 29-34 recommended)

## 5. **Network/API Issues** 🌐
Network connectivity problems can cause infinite loading.

### Solution:
- Check if the API endpoints are reachable
- Verify environment variables are set correctly
- Test with different network (WiFi vs mobile data)
- Check Android network security config

## Debugging Steps:

### Step 1: Check Permissions
1. Start the app on Android
2. When Welcome screen loads, tap "Login"
3. Choose "Check Permissions" option
4. Grant any denied permissions
5. Restart the app

### Step 2: Check Logs
```bash
# Monitor Android logs for errors
adb logcat | grep -E "(FATAL|ERROR|ReactNativeJS|ExpoModules|ccsa)"
```

### Step 3: Clean Build
```bash
# Clean everything and rebuild
npx expo start --clear
cd android && ./gradlew clean && cd ..
```

### Step 4: Test on Real Device
- Install Expo Go on a real Android device
- Scan the QR code to test
- Real devices often work better than emulators

## Quick Fixes:

### Fix 1: Permission Reset
```bash
# Reset app permissions on emulator
adb shell pm reset-permissions ng.edu.cosmopolitan.fims
```

### Fix 2: Clear App Data
```bash
# Clear app data completely
adb shell pm clear ng.edu.cosmopolitan.fims
```

### Fix 3: Restart ADB
```bash
adb kill-server
adb start-server
```

## Environment Variables Check:
Ensure these are set in your `.env.local`:
- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`

## Known Working Configuration:
- **Android API Level**: 29-34
- **Target SDK**: 34
- **Min SDK**: 21
- **Expo SDK**: 53
- **React Native**: 0.79.5

## If Nothing Works:
1. Try a different Android emulator (different API level)
2. Test on a real Android device
3. Check if the issue exists on iOS (to isolate Android-specific problems)
4. Review the Android manifest for permission conflicts

## Logs to Watch For:
- Permission denied errors
- Network timeout errors
- Firebase initialization failures
- Metro bundler connection issues
- JavaScript errors during navigation
