# FibriCheck Example React Native Application 
This folder contains a fully functioning sample application that uses the FibriCheck React Native SDK. 

> [!CAUTION]
> ⚠️ WARNING: DEVELOPERS BEWARE ⚠️
> Do NOT attempt to install @fibricheck/react-native-camera-sdk as a relative path!
>
> You may be tempted to install the library as a relative package by using 
> `@fibricheck/react-native-camera-sdk: "file:../"`
> This **does not** work and **will not** work.
> And yes the same goes for `link:../` and `portal:../`.
>
> Many devs have tried. Yet none have succeeded.
> Proceed only with npm install or yarn add to avoid the Curse of Infinite Errors.
>
> You’ve been warned! 🐉

## Requirements 
Running this application requires Xcode and/or Android Studio. Review the [React Native guide](https://reactnative.dev/docs/environment-setup?guide=native) to setup your environment.

This example targets React Native 0.79.x and supports both the legacy and New Architecture
renderers. The SDK supports RN 0.73+ and is explicitly tested through RN 0.87.0; see the
[compatibility fixtures](../compatibility-examples/README.md). The minimum device versions are iOS
13.4 and Android 7.0 (API level 24).

## Run the example 

From the `example` folder, execute the following steps: 
* `yarn install` - make sure that your GitHub tokens are configured correctly to access packages hosted on GitHub Registry
* For Android: `yarn android`
* For iOS: `yarn ios`

## Local development with yalc

If you need to test local SDK changes, use [yalc](https://github.com/wclr/yalc) — this is also the answer to the warning above.

### First-time setup

**1. Publish the SDK locally**

From the SDK root:
```sh
yalc publish
```

**2. Add it to the example app**

```sh
cd example
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

Then refresh the example dependency:

```sh
cd example
yalc update @fibricheck/react-native-camera-sdk
yarn install
```

iOS only — rebuild pods if native files changed:
```sh
cd ios && pod install && cd ..
```

### Restoring the published package

When you're done with local development, remove the Yalc link and restore the registry version:

```sh
cd example
yalc remove @fibricheck/react-native-camera-sdk
yarn install
```

## Troubleshooting
You can use the `npx react-native doctor` command to see if there are any errors with your dev environment. 


If you are failing to build and run the application, one or more of following actions might resolve the situation: 

* Clean the example's Gradle build outputs: `cd android && ./gradlew clean`
* Clean all caches using `npx react-native clean`
