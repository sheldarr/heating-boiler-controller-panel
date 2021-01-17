import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';
import { format, utcToZonedTime } from 'date-fns-tz';

import { Measurement, getMeasurements } from '../../../../database';

export default (req: NextApiRequest, res: NextApiResponse<Measurement[]>) => {
  const measurements = getMeasurements();

  res.status(StatusCodes.OK).json(
    measurements.map((measurement) => ({
      ...measurement,
      time: format(
        new Date(utcToZonedTime(measurement.time, process.env.TIMEZONE)),
        'HH:mm:ss',
      ),
    })),
  );
};
