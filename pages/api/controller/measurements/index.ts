import { NextApiRequest, NextApiResponse } from 'next';
import StatusCodes from 'http-status-codes';

import { getMeasurements } from '../../../../database';
import { ControllerMeasurement } from '../../../../api';

export default (
  req: NextApiRequest,
  res: NextApiResponse<ControllerMeasurement[]>,
) => {
  const measurements = getMeasurements();

  res.status(StatusCodes.OK).json(measurements);
};
