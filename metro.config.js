const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const isProduction = process.env.NODE_ENV === 'production';

// Enable aggressive minification and tree shaking
config.transformer.minifierConfig = {
  compress: {
    drop_console: isProduction,
    drop_debugger: true,
    pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
    passes: isProduction ? 5 : 1,
    dead_code: true,
    conditionals: true,
    booleans: true,
    unused: true,
    if_return: true,
    join_vars: true,
    collapse_vars: true,
    reduce_vars: true,
    warnings: false,
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    unsafe_math: true,
    unsafe_proto: true,
  },
  mangle: {
    toplevel: true,
    keep_fnames: false,
    safari10: false,
  },
  output: {
    comments: false,
    ascii_only: true,
    beautify: false,
  },
};

// Enable Hermes bytecode compilation
config.transformer.hermesCommand = 'hermes';

// Add SVG support
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Enable inline requires for better code splitting
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// Enable experimental import support (required for graph optimizations)
config.transformer.unstable_allowRequireContext = true;
config.transformer.experimentalImportSupport = true;

// Optimize asset resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Optimize caching
config.cacheStores = [
  {
    name: 'metro-cache',
    get: async () => null,
    set: async () => {},
  },
];

module.exports = config;