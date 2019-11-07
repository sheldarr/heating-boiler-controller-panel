/* eslint-disable @typescript-eslint/no-var-requires */

const { createServer } = require('http');
const url = require('url');
const { join } = require('path');
const next = require('next');
const CronJob = require('cron').CronJob;

const logger = require('./server/logger');
const initializeAxios = require('./server/axios');
const {
  broadcastControllerStatus,
  webSocketServer,
} = require('./server/websocket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleByNext = app.getRequestHandler();

const APP_PORT = Number(process.env.APP_PORT);
const LISTEN_ON_ALL_INTERFACES = '0.0.0.0';

initializeAxios();

new CronJob(process.env.CRON, broadcastControllerStatus, null, true);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname);

      return app.serveStatic(req, res, filePath);
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
