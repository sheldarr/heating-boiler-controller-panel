/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
  'settings.hysteresis': 2,
  'settings.mode': 'NORMAL',
  'settings.setpoint': 40,
  'temperature.input': 0,
  'temperature.output': 0,
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

  return { hysteresis, mode, setpoint };
};

const setSettings = (setpoint, hysteresis, mode) => {
  db.set('settings.setpoint', setpoint).write();
  db.set('settings.hysteresis', hysteresis).write();
  db.set('settings.mode', mode).write();
};

module.exports = {
  getSettings,
  getTemperatures,
  setSettings,
  setTemperatures,
};
