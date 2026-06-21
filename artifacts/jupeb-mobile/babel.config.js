module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache(true);

  const plugins = [];

  if (!isWeb) {
    // react-native-worklets must come BEFORE react-native-reanimated/plugin
    // (required by Reanimated 4.x — worklets runtime is separate from reanimated)
    try {
      require.resolve('react-native-worklets/plugin', { paths: [__dirname] });
      plugins.push('react-native-worklets/plugin');
    } catch {
      // worklets plugin not available
    }

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
