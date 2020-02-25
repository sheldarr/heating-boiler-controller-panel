const axios = require('axios');

const logger = require('../logger');

const DATA_LENGTH_LOG_LIMIT = 128;

function initializeAxios() {
  axios.interceptors.request.use((config) => {
    logger.info(
      `EXTERNAL REQUEST: ${String(config.method).toUpperCase()} ${
        config.url
      } ${JSON.stringify(config.data || {})} ${JSON.stringify(config.headers)}`
    );

    return config;
  });
  axios.interceptors.response.use(
    (response) => {
      logger.info(
        `EXTERNAL RESPONSE: ${response.status} ${String(
          response.config.method
        ).toUpperCase()} ${response.config.url} ${JSON.stringify(
          response.data
        ).slice(DATA_LENGTH_LOG_LIMIT)} ${JSON.stringify(response.headers)}`
      );

      return response;
    },
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error) => {
      if (error.response) {
        logger.error(
          `ERROR EXTERNAL RESPONSE: ${error.response.status} ${String(
            error.response.config.method
          ).toUpperCase()}  ${error.response.config.url} ${error.message}`,
          {
            data: error.response.data,
            headers: error.response.headers,
          }
        );
      } else if (error.request) {
        logger.error(
          `ERROR EXTERNAL REQUEST: ${String(
            error.config.method
          ).toUpperCase()} ${error.config.url} ${error.message}`
        );
      } else {
        logger.error(`AXIOS ERROR: ${error.message}`);
      }

      return Promise.reject(error);
    }
  );
}

module.exports = initializeAxios;
