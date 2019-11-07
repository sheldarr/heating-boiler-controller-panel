import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.send({
      fanOn: Math.random() >= 0.5,
      hysteresis: 2.0,
      inputTemperature: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      lastSync: new Date(),
      mode: 'NORMAL',
      outputTemperature: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      setpoint: 50,
    });
  }
};
