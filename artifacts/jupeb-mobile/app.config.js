const appJson = require('./app.json');

function safePlugins(plugins) {
  return plugins.filter((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;
    if (typeof name !== 'string') return true;
    try {
      require.resolve(name, { paths: [__dirname] });
      return true;
    } catch {
      return false;
    }
  });
}

const base = appJson.expo;

module.exports = {
  expo: {
    ...base,
    plugins: safePlugins(base.plugins || []),
  },
};
