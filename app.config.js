const IS_PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  expo: {
    name: 'Mini Games',
    slug: 'Test_Games',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'testgames',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    jsEngine: 'hermes',
    // Only include essential assets
    assetBundlePatterns: ['assets/images/icon.png', 'assets/images/adaptive-icon.png', 'assets/images/splash-icon.png'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.prathameshti.TestGames',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      bitcode: false,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.prathameshti.Test_Games',
      enableProguardInReleaseBuilds: true,
      enableSeparateBuildPerCPUArchitecture: true,
      // Minimal permissions
      permissions: [],
      blockedPermissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.CAMERA',
        'android.permission.READ_CONTACTS',
        'android.permission.WRITE_CONTACTS',
        'android.permission.READ_CALENDAR',
        'android.permission.WRITE_CALENDAR',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.READ_PHONE_STATE',
        'android.permission.WRITE_SETTINGS',
        'android.permission.READ_SMS',
        'android.permission.RECEIVE_SMS',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-font',
        {
          fonts: [],
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '2a2a7457-673e-46e8-a6cf-16e8b2b1a705',
      },
    },
    packagerOpts: {
      config: 'metro.config.js',
    },
    updates: {
      enabled: false,
      fallbackToCacheTimeout: 0,
    },
  },
};
