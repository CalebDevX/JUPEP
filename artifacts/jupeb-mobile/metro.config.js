const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On native platforms, react-native-web ships DOMRect with private class
// fields (#x, #y) that Hermes cannot compile. Redirect it to react-native
// so the web-only implementation never enters the native bundle.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && moduleName === 'react-native-web') {
    return context.resolveRequest(context, 'react-native', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Standard Expo transform allowlist.
// Both react-native-reanimated and react-native-gesture-handler match the
// `react-native` prefix so Babel will compile their TypeScript/JSX source.
// Do NOT add custom resolver overrides that point to lib/commonjs — those
// paths may not exist depending on the package version and cause the
// "Failed to get SHA-1" Metro error.
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!(' +
    '(jest-)?react-native' +
    '|@react-native(-community)?' +
    '|expo(nent)?' +
    '|@expo(nent)?/.*' +
    '|@expo-google-fonts/.*' +
    '|react-navigation' +
    '|@react-navigation/.*' +
    '|@unimodules/.*' +
    '|unimodules' +
    '|sentry-expo' +
    '|native-base' +
    '|react-native-svg' +
    '|nativewind' +
  ').*)',
];

module.exports = config;
