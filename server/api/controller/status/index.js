/* eslint-disable @typescript-eslint/no-var-requires */

const db = require('../../../db');

module.exports = (req, res) => {
  const status = db.getStatus();

  return res.send(status);
};
