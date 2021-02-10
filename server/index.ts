import { createServer } from 'http';
import axios from 'axios';
import next from 'next';
import { CronJob } from 'cron';
import { Server } from 'socket.io';
import { errorLogger, responseLogger, requestLogger } from 'axios-logger';

import {
  addMeasurement,
  Measurement,
  getMeasurements,
  setSettings,
  Settings,
} from '../database';
import { WebSocketEvents } from '../events';
import { ControllerStatus, setControllerSettings } from '../api';
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

const restorePreviousSetpoint = () => {
  const measurements = getMeasurements();

  const [lastMeasurement] = measurements.slice(-1);

  if (lastMeasurement) {
    logger.error(`Restoring previous setpoint: ${lastMeasurement.setpoint}`);

    return setControllerSettings({
      hysteresis: Number(process.env.NEXT_PUBLIC_HYSTERESIS),
      mode: 'NORMAL',
      setpoint: lastMeasurement.setpoint,
    });
  }

  logger.error('Could not restore previous setpoint');
};

const updateControllerStatusCronJob = new CronJob(
  process.env.UPDATE_STATUS_CRON,
  async () => {
    try {
      const { data } = await axios.get<ControllerStatus>(
        process.env.CONTROLLER_API_URL,
      );

      const {
        inputTemperature,
        outputTemperature,
        fanOn,
        hysteresis,
        mode,
        setpoint,
      } = data;

      if (setpoint === null) {
        return restorePreviousSetpoint();
      }

      io.emit(WebSocketEvents.REFRESH_MEASUREMENTS);
      io.emit(WebSocketEvents.REFRESH_SETTINGS);

      const lastSync = new Date().toISOString();

      const settings: Settings = {
        fanOn,
        hysteresis,
        lastSync,
        mode,
        setpoint,
      };

      setSettings(settings);

      const measurement: Measurement = {
        heap: data.heap || 0,
        inputTemperature,
        outputTemperature,
        setpoint,
        time: lastSync,
        trend: 'UNKNOWN',
      };

      addMeasurement(measurement);
    } catch (error) {
      logger.error(error);
    }
  },
);

server.on('error', (error) => {
  logger.error(error);
});

app.prepare().then(() => {
  server.listen(APP_PORT, () => {
    updateControllerStatusCronJob.start();
    logger.info(
      `> Update controller status cron job started (${process.env.UPDATE_STATUS_CRON})`,
    );

    logger.info(
      `> Ready on http://${LISTEN_ON_ALL_INTERFACES}:${APP_PORT} ${process.env.NODE_ENV}`,
    );
  });
});
