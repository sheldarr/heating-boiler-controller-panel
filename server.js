/* eslint-disable @typescript-eslint/no-var-requires */

const { createServer } = require('http');
const url = require('url');
const { join } = require('path');
const next = require('next');
const CronJob = require('cron').CronJob;
const express = require('express');
const bodyParser = require('body-parser');

const logger = require('./server/logger');
const initializeAxios = require('./server/axios');
const {
  broadcastControllerStatus,
  webSocketServer,
} = require('./server/websocket');

const apiControllerStatus = require('./server/api/controller/status');
const apiControllerSettings = require('./server/api/controller/settings');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleByNext = app.getRequestHandler();

const APP_PORT = Number(process.env.APP_PORT);
const LISTEN_ON_ALL_INTERFACES = '0.0.0.0';

initializeAxios();

const handleByExpress = express();

handleByExpress.use(bodyParser.json());
handleByExpress.use((req, res, next) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname } = parsedUrl;

  if (pathname.startsWith('/api')) {
    logger.info(
      `INTERNAL REQUEST: ${String(req.method).toUpperCase()} ${
        req.url
      } ${JSON.stringify(req.body)} ${JSON.stringify(req.headers)}`
    );
  }

  next();
});

const broadcastStatusCronJob = new CronJob(
  process.env.CRON,
  broadcastControllerStatus
);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname.startsWith('/api')) {
      handleByExpress.get('/api/controller/status', apiControllerStatus);
      handleByExpress.post('/api/controller/settings', apiControllerSettings);

      return handleByExpress(req, res);
    }

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname);

      return app.serveStatic(req, res, filePath);
    }

    handleByNext(req, res);
  })
    .on('upgrade', (request, socket, head) => {
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
        logger.error(err);
        throw err;
      }

      broadcastStatusCronJob.start();
      logger.info(
        `> Broadcast controller status cron job started (${process.env.CRON})`
      );

      logger.info(
        `> Ready on http://${LISTEN_ON_ALL_INTERFACES}:${APP_PORT} ${process.env.NODE_ENV}`
      );
    });
});
