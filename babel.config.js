module.exports = function (api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Enable lazy imports for better code splitting
          lazyImports: true,
        },
      ],
    ],
    plugins: [
      // Enable inline requires for code splitting
      [
        'transform-inline-environment-variables',
        {
          include: ['NODE_ENV'],
        },
      ],
      // Remove console statements in production
      ...(isProduction
        ? [
            [
              'transform-remove-console',
              {
                exclude: ['error'],
              },
            ],
            'transform-remove-debugger',
          ]
        : []),
      // Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          [
            'transform-remove-console',
            {
              exclude: ['error'],
            },
          ],
          'transform-remove-debugger',
        ],
      },
    },
  };
};
