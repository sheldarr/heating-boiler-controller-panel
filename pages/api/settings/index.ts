import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { setpoint, hysteresis, power, mode } = req.body;

    const notValidRequest = !setpoint || !hysteresis || !power || !mode;

    if (notValidRequest) {
      return res.status(400).send('BAD REQUEST');
    }

    const settings = `${setpoint} ${hysteresis} ${power} ${mode}`;
    console.log(`REQUEST ${process.env.CONTROLLER_URL} ${settings}`);

    axios
      .post(process.env.CONTROLLER_URL, settings)
      .then(({ data }) => {
        console.log(`RESPONSE: ${JSON.stringify(data)}`);

        return res.status(200).send('OK');
      })
      .catch((error) => {
        console.log(`ERROR RESPONSE: ${error}`);

        return res.status(500).send('ERROR');
      });
  }
};
