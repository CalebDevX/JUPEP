const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-worklets') {
    return context.resolveRequest(context, 'react-native-worklets-core', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
