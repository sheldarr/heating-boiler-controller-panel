import { createServer } from 'http';
import axios from 'axios';
import next from 'next';
import { CronJob } from 'cron';
import { Server } from 'socket.io';
import { errorLogger, responseLogger, requestLogger } from 'axios-logger';

import { setStatus } from '../database';
import { WebSocketEvents } from '../events';
import logger from './logger';

axios.interceptors.request.use(requestLogger, errorLogger);
axios.interceptors.response.use(responseLogger, errorLogger);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleByNext = app.getRequestHandler();

const APP_PORT = Number(process.env.APP_PORT);
const LISTEN_ON_ALL_INTERFACES = '0.0.0.0';

// eslint-disable-next-line prefer-const
let io: Server;

const server = createServer((req, res) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  req.io = io;

  handleByNext(req, res);
});

io = new Server(server);

const updateControllerStatusCronJob = new CronJob(
  process.env.UPDATE_STATUS_CRON,
  async () => {
    const { data } = await axios.get(process.env.CONTROLLER_API_URL);

    const {
      inputTemperature,
      outputTemperature,
      fanOn,
      hysteresis,
      mode,
      setpoint,
    } = data;

    const lastSync = new Date();

    io.emit(WebSocketEvents.REFRESH_MEASUREMENTS);
    io.emit(WebSocketEvents.REFRESH_STATUS);

    setStatus(
      inputTemperature,
      outputTemperature,
      setpoint,
      hysteresis,
      mode,
      fanOn,
      lastSync,
    );
  },
);

app.prepare().then(() => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  server.listen(APP_PORT, LISTEN_ON_ALL_INTERFACES, (err) => {
    if (err) {
      logger.error(err);
      throw err;
    }

    updateControllerStatusCronJob.start();
    logger.info(
      `> Update controller status cron job started (${process.env.UPDATE_STATUS_CRON})`,
    );

    logger.info(
      `> Ready on http://${LISTEN_ON_ALL_INTERFACES}:${APP_PORT} ${process.env.NODE_ENV}`,
    );
  });
});
