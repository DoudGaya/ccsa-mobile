#!/bin/bash

echo "🔧 CCSA FIMS Android Crash Diagnosis & Fix"
echo "=========================================="

echo ""
echo "🔍 Step 1: Running Expo Doctor..."
npx expo-doctor

echo ""
echo "🧹 Step 2: Cleaning project..."
npm run clean:cache

echo ""
echo "📱 Step 3: Building APK with crash fixes..."
echo "Choose your build method:"
echo "1. EAS Build APK (Recommended)"
echo "2. Local Build APK"
echo ""

read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "Building APK with EAS..."
        npm run build:apk
        ;;
    2)
        echo "Building APK locally..."
        npm run build:apk:local
        ;;
    *)
        echo "Invalid choice. Using EAS build..."
        npm run build:apk
        ;;
esac

echo ""
echo "✅ Build complete! Check the EAS dashboard or local build output."
echo ""
echo "🚨 IMPORTANT: If the app still crashes:"
echo "1. Create square icons (1024x1024 pixels)"
echo "2. Replace assets/icon.png and assets/adaptive-icon.png"
echo "3. Run 'npm run fix-icons' for guidance"
echo "4. Rebuild the APK"
