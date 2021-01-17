import { NextApiRequest, NextApiResponse } from 'next';
import { StatusCodes } from 'http-status-codes';

import { getTrend, Trend } from '../../../../database';

export default (req: NextApiRequest, res: NextApiResponse<Trend>) => {
  const trend = getTrend();

  res.status(StatusCodes.OK).send(trend);
};
