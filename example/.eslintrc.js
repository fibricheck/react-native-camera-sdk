const pluginJest = require('eslint-plugin-jest');

module.exports = {
  root: true,
  extends: '@react-native',
  plugins: [{ jest: pluginJest }],
};
