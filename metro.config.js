// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Optional: extend source extensions if you really need to
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json'
];

module.exports = config;
