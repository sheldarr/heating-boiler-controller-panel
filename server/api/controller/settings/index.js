const axios = require('axios');

const { broadcastControllerStatus } = require('../../../websocket');
const db = require('../../../db');
const logger = require('../../../logger');

module.exports = (req, res) => {
  const { setpoint, hysteresis, mode } = req.body;

  const notValidRequest = !setpoint || !hysteresis || !mode;

  if (notValidRequest) {
    return res.status(400).send('BAD REQUEST');
  }

  if (process.env.NODE_ENV === 'development') {
    db.setStatus(
      Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      setpoint,
      hysteresis,
      mode,
      true,
      new Date()
    );

    broadcastControllerStatus();

    return res.status(200).send('OK');
  }

  const settings = `${setpoint} ${hysteresis} ${mode}`;

  logger.warn(`Applying new settings: ${settings}`);

  axios
    .post(process.env.CONTROLLER_API_URL, settings)
    .then(() => {
      broadcastControllerStatus();
      logger.warn(`New settings applied: ${JSON.stringify(settings)}`);
      return res.status(200).send('OK');
    })
    .catch(() => {
      logger.warn(
        `New settings could not be applied: ${JSON.stringify(settings)}`
      );
      return res.status(500).send('ERROR');
    });
};
