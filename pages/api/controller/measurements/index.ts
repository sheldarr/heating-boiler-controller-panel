import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';

import { Measurement, getMeasurements } from '../../../../database';

export default (req: NextApiRequest, res: NextApiResponse<Measurement[]>) => {
  const measurements = getMeasurements();

  res.status(StatusCodes.OK).json(measurements);
};
