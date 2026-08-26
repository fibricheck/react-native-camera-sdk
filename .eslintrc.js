module.exports = {
  root: true,
  extends: ['@react-native'],
  settings: {
    react: {
      version: '19.0',
    },
  },
  ignorePatterns: ['build/', 'compatibility-examples/', 'example/', 'test-sequence/'],
  rules: {
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/prop-types': 'off',
  },
};
