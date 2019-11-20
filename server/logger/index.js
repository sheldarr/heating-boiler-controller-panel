/* eslint-disable @typescript-eslint/no-var-requires */

const { createLogger, format, transports } = require('winston');
const { cli, combine, timestamp } = format;

const commonFormat = combine(cli(), timestamp());

const logger = createLogger({
  format: commonFormat,
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/warn.log', level: 'warn' }),
    new transports.File({ filename: 'logs/info.log', level: 'info' }),
  ],
});

module.exports = logger;
