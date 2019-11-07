/* eslint-disable @typescript-eslint/no-var-requires */

const axios = require('axios');
const WebSocket = require('ws');

const logger = require('../logger');
const { setStatus } = require('../db');

const webSocketServer = new WebSocket.Server({ noServer: true });

const broadcast = (message) => {
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

const broadcastControllerStatus = async () => {
  logger.info(`REQUEST: ${process.env.CONTROLLER_STATUS_API_URL}`);

  const { data } = await axios.get(process.env.CONTROLLER_STATUS_API_URL);

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
    lastSync
  );

  broadcast({ ...data, lastSync });

  logger.info('RESPONSE:', data);
};

module.exports = {
  broadcast,
  broadcastControllerStatus,
  webSocketServer,
};
