const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ── Force gesture-handler and reanimated to use compiled output ─────────────
//    Their package.json "react-native" fields point to TypeScript source
//    which requires Babel plugins that aren't hoisted in our node_modules.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-gesture-handler') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-gesture-handler/lib/commonjs/index.js',
      ),
    };
  }
  if (moduleName === 'react-native-reanimated') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'node_modules/react-native-reanimated/lib/module/index.js',
      ),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// ── Do NOT run Babel on pre-compiled gesture-handler / reanimated ───────────
//    Expo's transform pipeline re-processes node_modules that match the
//    allowlist. We exclude these two packages so their compiled JS is used
//    as-is without triggering missing @babel/plugin-proposal-* errors.
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!' +
    '(jest-)?react-native' +
    '(?!(-gesture-handler|-reanimated))' +
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
    ').*',
];

module.exports = config;
