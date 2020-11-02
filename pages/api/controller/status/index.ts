import { NextApiRequest, NextApiResponse } from 'next';
import StatusCodes from 'http-status-codes';

import { getStatus } from '../../../../database';
import { ControllerStatus } from '../../../../api';

export default (
  req: NextApiRequest,
  res: NextApiResponse<ControllerStatus>,
) => {
  const status = getStatus();

  res.status(StatusCodes.OK).json(status);
};
