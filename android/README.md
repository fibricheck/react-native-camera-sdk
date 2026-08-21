README
======

The React Native SDK supports Android 7.0 (API level 24) and newer with React Native 0.73+. Device
tests cover RN 0.73.11 with Paper, RN 0.79.7 with Paper and Fabric, and RN 0.87.0 with Fabric. RN
0.87 is the newest tested version, not a maximum supported version.

If you want to publish the lib as a maven dependency, follow these steps before publishing a new version to npm:

1. Be sure to have the Android [SDK](https://developer.android.com/studio/index.html) and [NDK](https://developer.android.com/ndk/guides/index.html) installed
2. Be sure to have a `local.properties` file in this folder that points to the Android SDK and NDK
```
ndk.dir=/Users/{username}/Library/Android/sdk/ndk-bundle
sdk.dir=/Users/{username}/Library/Android/sdk
```
3. Delete the `maven` folder
4. Run `./gradlew installArchives`
5. Verify that latest set of generated files is in the maven folder with the correct version number
