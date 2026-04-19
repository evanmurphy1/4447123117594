// 19/04/26: Basic jest expo setup.
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|expo-modules-core|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|unimodules|sentry-expo|native-base|react-native-svg))',
  ],
};
