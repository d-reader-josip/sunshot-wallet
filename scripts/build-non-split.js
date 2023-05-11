#!/usr/bin/env node

// Disables code splitting into chunks
// See https://github.com/facebook/create-react-app/issues/5306#issuecomment-433425838

const path = require('path');
const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
let config = defaults.__get__("config");

config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
};

config.optimization.runtimeChunk = false;

config.resolve.fallback = {
  ...config.resolve.fallback,
  assert: require.resolve('assert'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  zlib: require.resolve('browserify-zlib'),
  path: require.resolve('path-browserify'),
  buffer: require.resolve('buffer'),
};

module.exports = defaults;