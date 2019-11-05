/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
  'temperature.input': 0,
  'temperature.output': 0,
  'settings.setpoint': 40,
  'settings.hysteresis': 2,
  'settings.mode': 'NORMAL',
}).write();

const getTemperatures = () => {
  const input = db.get('temperature.input').value();
  const output = db.get('temperature.output').value();

  return { input, output };
};

const setTemperatures = (inputTemperature, outputTemperature) => {
  db.set('temperature.input', inputTemperature).write();
  db.set('temperature.output', outputTemperature).write();
};

const getSettings = () => {
  const setpoint = db.get('settings.setpoint').value();
  const hysteresis = db.get('settings.hysteresis').value();
  const mode = db.get('settings.mode').value();

  return { setpoint, hysteresis, mode };
};

module.exports = {
  setTemperatures,
  getTemperatures,
  getSettings,
};
