const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure JSON file handling
config.resolver.sourceExts.push('json');

// Configure blacklist to exclude large JSON files during builds
config.resolver.blacklistRE = /nigeria\.json$|states-and-lgas-and-wards-and-polling-units\.json$/;

// Add asset extensions for better optimization
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj');

// Firebase optimization for production builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Optimize transformer for better performance in production builds
config.transformer = {
  ...config.transformer,
  // Enable async import support for Firebase
  asyncRequireModulePath: require.resolve('metro-runtime/src/modules/asyncRequire'),
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Basic configuration compatible with React Native 0.73.6
config.resolver.platforms = ['native', 'android', 'ios'];

module.exports = config;
