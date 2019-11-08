/* eslint-disable @typescript-eslint/no-var-requires */

const { createLogger, format, transports } = require('winston');
const { colorize, combine, timestamp, simple } = format;

const logger = createLogger({
  format: combine(colorize(), timestamp(), simple()),
  transports: [new transports.Console()],
});

module.exports = logger;
