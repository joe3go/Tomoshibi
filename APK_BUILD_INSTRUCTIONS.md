# Direct APK Installation Guide for Tomoshibi

Your Japanese learning app is ready for direct APK installation on Android devices without going through the Play Store.

## 📱 Quick APK Generation

### Method 1: Using Android Studio (Recommended)
1. Open Android Studio
2. Run: `npx cap open android`
3. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK will be generated in: `android/app/build/outputs/apk/debug/`

### Method 2: Command Line Build
```bash
# Navigate to android directory
cd android

# Build debug APK
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📥 Installing the APK

### On Android Device:
1. **Enable Unknown Sources**: Settings → Security → Install unknown apps
2. **Transfer APK**: Copy the APK file to your device
3. **Install**: Tap the APK file and follow prompts
4. **Launch**: Find "Tomoshibi - Japanese Learning" in your app drawer

### Testing on Device:
1. **USB Debugging**: Enable Developer Options → USB Debugging
2. **Connect Device**: Connect via USB cable
3. **Install via ADB**: `adb install app-debug.apk`

## 🎯 App Features (Mobile Optimized)

### ✅ Study Interface
- Fullscreen Japanese sentence cards
- Stable furigana display (no layout shifts)
- Touch-friendly answer buttons
- Mobile-optimized typography

### ✅ Navigation
- Touch-friendly menu system
- Mobile-responsive design
- Gesture support for card interactions
- Hardware back button handling

### ✅ Japanese Content
- JLPT N5-N1 sentence cards
- Accurate furigana positioning
- Vocabulary highlighting
- SRS-based learning algorithm

## 🔧 Build Configuration

### App Details:
- **Package**: com.tomoshibi.japanese
- **Name**: Tomoshibi - Japanese Learning
- **Target**: Android API 34 (Android 14)
- **Architecture**: ARM64 + x86_64

### Permissions:
- Internet access for content updates
- Network state monitoring
- Vibration for feedback
- Storage for offline content

## 📋 File Locations

```
Project Structure:
├── android/                    # Android project
│   ├── app/build/outputs/apk/ # Generated APK files
│   └── app/src/main/          # Android source
├── dist/                      # Web assets (synced to Android)
├── capacitor.config.ts        # Capacitor configuration
└── APK_BUILD_INSTRUCTIONS.md  # This file
```

## 🚀 Distribution Options

### Direct Installation:
- Share APK file directly with users
- No Play Store approval needed
- Instant distribution
- Full control over updates

### Self-Hosting:
- Host APK on your website
- Provide download link
- Include installation instructions
- Monitor download analytics

## 🔒 Security Notes

### APK Signing:
- Debug APK includes debug signature
- For production: create release keystore
- Sign APK for security verification

### User Education:
- Inform users about "Unknown Sources" setting
- Provide clear installation steps
- Include screenshots if needed

Your Tomoshibi Japanese learning app is now ready for direct APK distribution outside the Play Store!