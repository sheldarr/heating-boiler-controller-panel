import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { getSettings } from '../../../../database';

import logger from '../../../../server/logger';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const settings = getSettings();

    return res.status(StatusCodes.OK).json(settings);
  }

  const { setpoint, hysteresis, mode } = req.body;

  const notValidRequest = !setpoint || !hysteresis || !mode;

  if (notValidRequest) {
    return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
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
      return res.status(StatusCodes.OK).send(ReasonPhrases.OK);
    })
    .catch(() => {
      logger.warn(
        `New settings could not be applied: ${JSON.stringify(settings)}`,
      );
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(ReasonPhrases.INTERNAL_SERVER_ERROR);
    });
};
