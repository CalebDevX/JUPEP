module.exports = function (api) {
  const isWeb = api.caller((caller) => caller && caller.platform === 'web');
  api.cache(true);

  const plugins = [];
  if (!isWeb) {
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
