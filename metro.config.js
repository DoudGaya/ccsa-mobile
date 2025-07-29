const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure JSON file handling
config.resolver.sourceExts.push('json');

// Configure blacklist to exclude duplicate large JSON files during builds
config.resolver.blacklistRE = /assets\/nigeria\.json$|assets\/location\/polling-units-by-ward\.json$|assets\/location\/polling-by-state\/.*\.json$/;

// Add asset extensions for better optimization
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj');

// Firebase optimization for production builds
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Optimize transformer for production builds
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
    },
  },
  // Optimize for production
  maxWorkers: 2,
  experimentalImportSupport: false,
};

// Production-optimized configuration
config.resolver.platforms = ['native', 'android', 'ios'];

module.exports = config;
