import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    return res.send({
      fanOn: true,
      hysteresis: 2.0,
      inputTemperature: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      mode: 'NORMAL',
      outputTemperature: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      power: 50,
      setpoint: 50,
    });
  }
};