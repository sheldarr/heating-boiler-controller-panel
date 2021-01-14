import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import logger from '../../../../server/logger';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { setpoint, hysteresis, mode } = req.body;

  const notValidRequest = !setpoint || !hysteresis || !mode;

  if (notValidRequest) {
    return res.status(400).send('BAD REQUEST');
  }

  const settings = `${setpoint} ${hysteresis} ${mode}`;

  logger.warn(`Applying new settings: ${settings}`);

  axios
    .post(process.env.CONTROLLER_API_URL, settings)
    .then(() => {
      logger.warn(
        `New settings applied: ${JSON.stringify(settings)}`,
        req.headers,
      );
      return res.status(200).send('OK');
    })
    .catch(() => {
      logger.warn(
        `New settings could not be applied: ${JSON.stringify(settings)}`,
      );
      return res.status(500).send('ERROR');
    });
};
