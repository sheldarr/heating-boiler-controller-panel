const { getStatus } = require('../../../db');

module.exports = (req, res) => {
  const status = getStatus();

  return res.send(status);
};
