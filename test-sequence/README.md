# Test Sequence App

A React Native app that runs a structured sequence of test steps against the Camera SDK to verify all events fire correctly on both Android and iOS.

## Local development with yalc

[yalc](https://github.com/wclr/yalc) lets you consume a local build of the SDK without publishing to npm.

### First-time setup

**1. Publish the SDK locally**

From the SDK root:
```sh
yalc publish
```

**2. Add it to the test-sequence app**

```sh
cd test-sequence
yalc add @fibricheck/react-native-camera-sdk
yarn install
```

**3. iOS only — re-run pod install**

```sh
cd ios && pod install && cd ..
```

### Iterating on the SDK

After changing SDK source files, republish from the SDK root:

```sh
yalc publish
```

iOS only — rebuild pods if native files changed:
```sh
cd ios && pod install && cd ..
```

### Restoring the published package

When you're done with local development, remove the yalc link and restore the npm version:

```sh
cd test-sequence
yalc remove @fibricheck/react-native-camera-sdk
yarn install
```

## Running the app

```sh
# Android
yarn android

# iOS
yarn ios
```
