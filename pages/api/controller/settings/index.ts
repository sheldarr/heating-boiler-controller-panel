import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { setpoint, hysteresis, mode } = req.body;

  const notValidRequest = !setpoint || !hysteresis || !mode;

  if (notValidRequest) {
    return res.status(400).send('BAD REQUEST');
  }

  const settings = `${setpoint} ${hysteresis} ${mode}`;

  console.warn(`Applying new settings: ${settings}`);

  axios
    .post(process.env.CONTROLLER_API_URL, settings)
    .then(() => {
      console.warn(`New settings applied: ${JSON.stringify(settings)}`);
      return res.status(200).send('OK');
    })
    .catch(() => {
      console.warn(
        `New settings could not be applied: ${JSON.stringify(settings)}`,
      );
      return res.status(500).send('ERROR');
    });
};
