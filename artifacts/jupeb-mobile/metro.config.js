const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ── Platform-aware module resolution ────────────────────────────────────────
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // react-native-web uses private class fields (#x, #y etc.) in its DOMRect
  // implementation which Hermes cannot compile on native platforms. Map it to
  // react-native itself so native builds never bundle the web-only code.
  if (platform !== 'web' && moduleName === 'react-native-web') {
    return context.resolveRequest(context, 'react-native', platform);
  }

  // Force gesture-handler and reanimated to use pre-compiled CommonJS output.
  // Their package.json "react-native" fields point to TypeScript source which
  // requires Babel plugins that aren't hoisted in this monorepo layout.
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
        'node_modules/react-native-reanimated/lib/commonjs/index.js',
      ),
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

// ── Do NOT run Babel on pre-compiled gesture-handler / reanimated ───────────
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
