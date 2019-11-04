/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const { createServer } = require('http');
const axios = require('axios');
const next = require('next');
const CronJob = require('cron').CronJob;
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  format: combine(timestamp(), prettyPrint()),
  transports: [new transports.Console()],
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

new CronJob(
  process.env.CRON,
  async () => {
    logger.info(`REQUEST: ${process.env.CONTROLLER_URL}`);

    const { data } = await axios.get(process.env.CONTROLLER_URL);

    logger.info('RESPONSE:', data);
  },
  null,
  true
);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) {
      throw err;
    }

    logger.info('> Ready on http://localhost:3000');
  });
});
