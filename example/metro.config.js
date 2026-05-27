const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    blockList: [
      // Prevent Metro from processing the test-sequence app when watching the repo root.
      new RegExp(`${path.resolve(root, 'test-sequence')}/.*`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
