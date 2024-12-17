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

## Run the example 

From the `example` folder, execute the following steps: 
* `yarn install` - make sure that your GitHub tokens are configured correctly to access packages hosted on GitHub Registry
* For android: `npm run android`
* For ios: `npm run ios`

## Troubleshooting
You can use the `npx react-native doctor` command to see if there are any errors with your dev environment. 


If you are failing to build and run the application, one or more of following actions might resolve the situation: 

* Clean your gradle build folder: `rm -rf ~/.gradle`
* Clean all caches using `npx react-native clean`

