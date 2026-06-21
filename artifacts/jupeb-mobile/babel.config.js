module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache(true);

  const plugins = [];

  if (!isWeb) {
    // react-native-reanimated 4.x bundles react-native-worklets internally.
    // Adding react-native-worklets/plugin separately causes a fatal Babel duplicate.
    // Only include reanimated/plugin — it covers worklets too.
    try {
      require.resolve('react-native-reanimated/plugin', { paths: [__dirname] });
      plugins.push('react-native-reanimated/plugin');
    } catch {
      // reanimated plugin not available (e.g. web-only Metro start)
    }
  }

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins,
  };
};
