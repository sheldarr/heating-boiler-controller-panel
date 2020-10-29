const axios = require('axios');
const WebSocket = require('ws');

const { getMeasurements, getStatus, setStatus } = require('../db');

const webSocketServer = new WebSocket.Server({ noServer: true });

const broadcast = (eventName, message) => {
  webSocketServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          eventName,
          ...message,
        }),
      );
    }
  });
};

const broadcastControllerStatus = async () => {
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

  const status = getStatus();

  broadcast('status', status);
};

const broadcastMeasurements = async () => {
  const measurements = getMeasurements();

  broadcast('measurements', { measurements });
};

module.exports = {
  broadcast,
  broadcastControllerStatus,
  broadcastMeasurements,
  webSocketServer,
};
