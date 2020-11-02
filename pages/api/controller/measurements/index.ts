import { NextApiRequest, NextApiResponse } from 'next';
import StatusCodes from 'http-status-codes';

import { getMeasurements } from '../../../../server/db';
import { ControllerMeasurement } from '../../../../api';

export default (
  req: NextApiRequest,
  res: NextApiResponse<ControllerMeasurement[]>,
) => {
  const measurements = getMeasurements();

  res.status(StatusCodes.OK).json(measurements);
};
