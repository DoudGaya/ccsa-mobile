# Android Testing Guide

## Current Status
✅ Expo dev server is running with cache cleared
✅ Permission debugging screen implemented
✅ Missing Android permissions added to app.json
✅ Firebase Auth persistence fixed
✅ Dependencies cleaned and reinstalled

## Testing Steps

### 1. Connect Your Android Device/Emulator
```bash
# If you have Android SDK installed, check connected devices:
adb devices

# If no devices are listed, ensure:
# - USB debugging is enabled on your device
# - Your emulator is running
# - Your device drivers are installed
```

### 2. Install and Test the App

#### Option A: Development Version (Recommended for debugging)
```bash
# The dev server is already running, so in the Expo Go app:
# 1. Open Expo Go on your Android device
# 2. Scan the QR code from the terminal or go to the URL shown
# 3. The app should load with all recent fixes
```

#### Option B: Build APK (if needed)
```bash
# Build development APK
npx eas build --platform android --profile development --local

# Or build preview APK
npx eas build --platform android --profile preview --local
```

### 3. Test Permission Debugging

When the app loads on Android:

1. **Welcome Screen Test:**
   - App should load and display the welcome screen properly
   - The logo/icon should be visible
   - The screen should fill the device properly

2. **Permission Debug Access:**
   - From the welcome screen, look for a "Debug Permissions" button or similar navigation
   - Tap on it to access the Permission Debug Screen

3. **Permission Debug Screen:**
   - This screen will show the status of all required permissions:
     - Camera
     - Location (Fine and Coarse)
     - Storage/Media permissions
     - Network state
   - Each permission will show as "granted" or "denied"
   - If any are denied, the screen should provide buttons to request them

4. **Permission Request Test:**
   - Tap "Request All Permissions" button
   - Android should show system permission dialogs
   - Grant all requested permissions
   - Return to the app and verify all permissions now show as "granted"

### 4. Navigation Test

After permissions are granted:
1. Navigate back to the main app flow
2. Test that the app proceeds past the welcome screen
3. Verify that location-dependent features work (since location was a major issue)

### 5. Error Monitoring

Watch for these specific issues that were previously causing problems:

#### A. Firebase Auth Issues
- Should no longer see AsyncStorage warnings
- Authentication should work properly

#### B. Location Service Issues
- The hierarchical data lookup bug (Kano Municipal error) should be fixed
- Location picker should work without crashing

#### C. Permission-Related Crashes
- App should not crash when accessing camera or location
- Proper permission prompts should appear

### 6. Log Monitoring

If you have access to Android logs:
```bash
# Monitor Android logs for our app
adb logcat | grep -i "expo\|react\|ccsa"

# Or for more specific logs
adb logcat | grep -E "(ERROR|FATAL|CRASH)"
```

### 7. Common Issues and Solutions

#### If App Still Stuck on Welcome Screen:
1. Use the Permission Debug Screen to check all permissions
2. Clear app data: Settings > Apps > Your App > Storage > Clear Data
3. Uninstall and reinstall the app
4. Check if the device has sufficient storage space

#### If Permissions Don't Work:
1. Check device settings manually: Settings > Apps > Your App > Permissions
2. Ensure all required permissions are enabled
3. Try revoking and re-granting permissions through the debug screen

#### If App Crashes:
1. Note exactly when it crashes (during startup, when accessing specific features, etc.)
2. Check if it's related to specific permissions or features
3. Use the troubleshooting guide in ANDROID_STUCK_TROUBLESHOOTING.md

## Success Criteria

The app is working correctly when:
- ✅ App loads and displays welcome screen properly
- ✅ Permission debug screen is accessible and functional
- ✅ All required permissions can be granted successfully
- ✅ App navigates past welcome screen to main functionality
- ✅ Location services work without the "Kano Municipal" error
- ✅ Firebase authentication works without warnings
- ✅ No permission-related crashes occur

## Next Steps After Testing

1. **If successful:** The Android issues are resolved!
2. **If still having issues:** Document the specific behavior you're seeing, and we can investigate further.
3. **For production:** Once everything works in development, build the production APK.

## Quick Commands Reference

```bash
# Start development server (already running)
npx expo start --clear

# Build development APK
npx eas build --platform android --profile development --local

# Build production APK
npx eas build --platform android --profile production --local

# Check dependencies
npx expo doctor

# Clear all caches
npx expo start --clear --reset-cache
```
