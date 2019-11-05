/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const { createServer } = require('http');
const url = require('url');
const { join } = require('path');
const axios = require('axios');
const next = require('next');
const CronJob = require('cron').CronJob;
const { createLogger, format, transports } = require('winston');
const WebSocket = require('ws');
const { combine, timestamp, simple } = format;

const { setTemperatures, setSettings } = require('./server/db');

const logger = createLogger({
  format: combine(timestamp(), simple()),
  transports: [new transports.Console()],
});

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleByNext = app.getRequestHandler();

const webSocketServer = new WebSocket.Server({ noServer: true });

const APP_PORT = Number(process.env.APP_PORT);
const LISTEN_ON_ALL_INTERFACES = '0.0.0.0';

new CronJob(
  process.env.CRON,
  async () => {
    logger.info(`REQUEST: ${process.env.CONTROLLER_URL}`);

    const { data } = await axios.get(process.env.CONTROLLER_URL);

    const {
      inputTemperature,
      outputTemperature,
      setpoint,
      hysteresis,
      mode,
    } = data;

    setTemperatures(inputTemperature, outputTemperature);
    setSettings(setpoint, hysteresis, mode);

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
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname);

      app.serveStatic(req, res, filePath);
    }

    handleByNext(req, res);
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
    .listen(APP_PORT, LISTEN_ON_ALL_INTERFACES, (err) => {
      if (err) {
        throw err;
      }

      logger.info(`> Ready on http://${LISTEN_ON_ALL_INTERFACES}:${APP_PORT}`);
    });
});
