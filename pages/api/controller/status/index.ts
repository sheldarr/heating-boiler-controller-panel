import { NextApiRequest, NextApiResponse } from 'next';

import db from '../../../../server/db';

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const settings = db.getStatus();

    return res.send(settings);
  }
};
