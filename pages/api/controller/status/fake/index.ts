import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const outputTemperature = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
    const setpoint = 50;

    return res.send({
      fanOn: outputTemperature <= setpoint,
      hysteresis: 2.0,
      inputTemperature: Math.floor(Math.random() * (60 - 30 + 1)) + 30,
      lastSync: new Date(),
      mode: 'NORMAL',
      outputTemperature,
      setpoint,
    });
  }
};
