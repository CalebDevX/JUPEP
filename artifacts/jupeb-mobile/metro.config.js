const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Expose packages from the monorepo workspace root (lib/*, etc.)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Also watch the workspace lib packages so Metro picks up local changes.
config.watchFolders = [
  path.resolve(workspaceRoot, 'lib'),
];

// On native platforms, react-native-web ships DOMRect with private class
// fields (#x, #y) that Hermes cannot compile.
// 1. Redirect the bare 'react-native-web' import → 'react-native' so the
//    web-only code never enters native bundles.
// 2. The transformIgnorePatterns below also ensures Babel transpiles any
//    sub-path imports (e.g. react-native-web/src/…) as a safety net.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && moduleName === 'react-native-web') {
    return context.resolveRequest(context, 'react-native', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Transform allowlist: ensure Babel compiles these packages.
// react-native-web is included so private class fields in DOMRect get
// transpiled to ordinary property syntax before Hermes sees them.
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
    '|react-native-web' +
  ').*)',
];

module.exports = config;
