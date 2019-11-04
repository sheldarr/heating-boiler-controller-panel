/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const withOffline = require('next-offline');
const withCSS = require('@zeit/next-css');

module.exports = withOffline(
  withCSS({
    webpack: (config) => {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      };

      return config;
    },
  })
);
