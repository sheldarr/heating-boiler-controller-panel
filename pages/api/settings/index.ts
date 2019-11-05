import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../server/db';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const settings = db.getSettings();

    return res.send(settings);
  }

  if (req.method === 'POST') {
    const { setpoint, hysteresis, power, mode } = req.body;

    const notValidRequest = !setpoint || !hysteresis || !power || !mode;

    if (notValidRequest) {
      return res.status(400).send('BAD REQUEST');
    }

    const settings = `${setpoint} ${hysteresis} ${power} ${mode}`;
    console.log(`Saving settings to controller ${settings}`);

    axios
      .post(process.env.CONTROLLER_URL, settings)
      .then(({ data }) => {
        console.log(`Response: ${JSON.stringify(data)}`);

        return res.status(200).send('OK');
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send('ERROR');
      });
  }
};
