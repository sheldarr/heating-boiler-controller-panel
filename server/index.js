const { createServer } = require('http');
const axios = require('axios');
const next = require('next');
const CronJob = require('cron').CronJob;
const AxiosLogger = require('axios-logger');

const { getMeasurements, getStatus, setStatus } = require('../database');
const logger = require('./logger');

axios.default.interceptors.request.use(
  AxiosLogger.requestLogger,
  AxiosLogger.errorLogger,
);
axios.default.interceptors.response.use(
  AxiosLogger.responseLogger,
  AxiosLogger.errorLogger,
);

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handleByNext = app.getRequestHandler();

const APP_PORT = Number(process.env.APP_PORT);
const LISTEN_ON_ALL_INTERFACES = '0.0.0.0';

let io;

const server = createServer((req, res) => {
  req.io = io;

  handleByNext(req, res);
});

io = require('socket.io')(server);

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

const broadcastControllerStatusCronJob = new CronJob(
  process.env.BROADCAST_STATUS_CRON,
  async () => {
    const status = getStatus();

    io.emit('status', status);
  },
);

const broadcastMeasurementsCronJob = new CronJob(
  process.env.BROADCAST_MEASUREMENTS_CRON,
  () => {
    const measurements = getMeasurements();

    io.emit('measurements', measurements);
  },
);

app.prepare().then(() => {
  server.listen(APP_PORT, LISTEN_ON_ALL_INTERFACES, (err) => {
    if (err) {
      logger.error(err);
      throw err;
    }

    updateControllerStatusCronJob.start();
    logger.info(
      `> Update controller status cron job started (${process.env.UPDATE_STATUS_CRON})`,
    );

    broadcastControllerStatusCronJob.start();
    logger.info(
      `> Broadcast controller status cron job started (${process.env.BROADCAST_STATUS_CRON})`,
    );

    broadcastMeasurementsCronJob.start();
    logger.info(
      `> Broadcast measurements cron job started (${process.env.BROADCAST_MEASUREMENTS_CRON})`,
    );

    logger.info(
      `> Ready on http://${LISTEN_ON_ALL_INTERFACES}:${APP_PORT} ${process.env.NODE_ENV}`,
    );
  });
});
