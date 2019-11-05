/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const { createServer } = require('http');
const url = require('url');
const axios = require('axios');
const next = require('next');
const CronJob = require('cron').CronJob;
const { createLogger, format, transports } = require('winston');
const WebSocket = require('ws');
const { combine, timestamp, simple } = format;

const logger = createLogger({
  format: combine(timestamp(), simple()),
  transports: [new transports.Console()],
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const webSocketServer = new WebSocket.Server({ noServer: true });

new CronJob(
  process.env.CRON,
  async () => {
    logger.info(`REQUEST: ${process.env.CONTROLLER_URL}`);

    const { data } = await axios.get(process.env.CONTROLLER_URL);

    webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });

    logger.info('RESPONSE:', data);
  },
  null,
  true
);

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  })
    .on('upgrade', (request, socket, head) => {
      logger.info(head);
      const pathname = url.parse(request.url).pathname;

      if (pathname === '/websocket') {
        webSocketServer.handleUpgrade(request, socket, head, (ws) => {
          webSocketServer.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    })
    .listen(3000, (err) => {
      if (err) {
        throw err;
      }

      logger.info('> Ready on http://localhost:3000');
    });
});