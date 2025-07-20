const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure JSON file handling
config.resolver.sourceExts.push('json');

// Configure blacklist to exclude large JSON files during builds
config.resolver.blacklistRE = /nigeria\.json$|states-and-lgas-and-wards-and-polling-units\.json$/;

// Basic configuration compatible with React Native 0.73.6
config.resolver.platforms = ['native', 'android', 'ios'];

module.exports = config;
