# Creating NHFarming Apps with Expo

## What is Expo?
Expo is the easiest way to create React Native apps with minimal setup.

## Step 1: Install Expo CLI
```bash
npm install -g @expo/cli
```

## Step 2: Create Expo Project
```bash
npx create-expo-app NHFarmingApp
cd NHFarmingApp
```

## Step 3: Install Dependencies
```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-paper
npm install @react-native-async-storage/async-storage
npm install expo-camera
npm install expo-location
npm install expo-notifications
```

## Step 4: Convert Your Components
- Copy your React components
- Replace Material-UI with React Native Paper
- Update styling to use StyleSheet
- Replace localStorage with AsyncStorage

## Step 5: Test on Device
```bash
npx expo start
```
Then scan QR code with Expo Go app on your phone.

## Step 6: Build for App Stores
```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## Step 7: Submit to Stores
- Use Expo's build service
- Submit through App Store Connect/Google Play Console

## Advantages of Expo:
- ✅ Zero configuration
- ✅ Over-the-air updates
- ✅ Built-in native features
- ✅ Easy testing on real devices
- ✅ Managed workflow 