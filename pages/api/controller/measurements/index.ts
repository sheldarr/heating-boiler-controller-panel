import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { format } from 'date-fns';

import { Measurement, getMeasurements } from '../../../../database';

export default (req: NextApiRequest, res: NextApiResponse<Measurement[]>) => {
  const measurements = getMeasurements();

  res.status(StatusCodes.OK).json(
    measurements.map((measurement) => ({
      ...measurement,
      time: format(new Date(measurement.time), 'HH:mm:ss'),
    })),
  );
};
