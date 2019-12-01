const { getMeasurements } = require('../../../db');

module.exports = (req, res) => {
  const measurements = getMeasurements();

  return res.send(measurements);
};
