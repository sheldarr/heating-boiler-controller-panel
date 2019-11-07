/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const withOffline = require('next-offline');
const withCSS = require('@zeit/next-css');

module.exports = withOffline(
  withCSS({
    env: {
      CONTROLLER_STATUS_API_URL: process.env.CONTROLLER_STATUS_API_URL,
      HOSTNAME: process.env.HOSTNAME,
      PROTOCOL: process.env.PROTOCOL,
      WS_PROTOCOL: process.env.WS_PROTOCOL,
    },
    webpack: (config) => {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      };

      return config;
    },
  })
);
