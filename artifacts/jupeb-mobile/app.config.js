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

const NEW_PROJECT_ID = '88c415e3-b466-44f9-9018-50a1230331a8';

const plugins = [
  'expo-router',
  'expo-secure-store',
  'expo-updates',
  [
    'expo-splash-screen',
    {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0f0f14',
    },
  ],
  [
    'expo-notifications',
    {
      sounds: [
        './assets/sounds/notification.wav',
        './assets/sounds/streak.wav',
      ],
      androidMode: 'default',
      androidCollapsedTitle: 'JUPEB Prep',
      iosDisplayInForeground: true,
    },
  ],
  'expo-web-browser',
];

module.exports = {
  expo: {
    name: 'JUPEB Prep',
    slug: 'jupeb-mobile',
    version: '1.0.1',
    scheme: 'jupeb',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.jupeb.prep',
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#0f0f14',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: 'com.jupeb.prep',
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    updates: {
      url: `https://u.expo.dev/${NEW_PROJECT_ID}`,
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    plugins: safePlugins(plugins),
    experiments: {
      typedRoutes: false,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: NEW_PROJECT_ID,
      },
    },
    owner: 'achek',
  },
};
