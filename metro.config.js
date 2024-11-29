// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Add any custom configurations here if needed
defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json'
];

module.exports = defaultConfig;