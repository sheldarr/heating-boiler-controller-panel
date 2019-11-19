/* eslint-disable @typescript-eslint/no-var-requires */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const MAX_AMOUNT_OF_MEASUREMENTS = 120;

db.defaults({
  'settings.fanOn': false,
  'settings.hysteresis': 2,
  'settings.mode': 'NORMAL',
  'settings.setpoint': 40,
  'status.lastSync': new Date(),
  'temperature.input': 0,
  'temperature.measurements': [],
  'temperature.output': 0,
}).write();

const getStatus = () => {
  const fanOn = db.get('settings.fanOn').value();
  const hysteresis = db.get('settings.hysteresis').value();
  const inputTemperature = db.get('temperature.input').value();
  const lastSync = db.get('status.lastSync').value();
  const mode = db.get('settings.mode').value();
  const outputTemperature = db.get('temperature.output').value();
  const setpoint = db.get('settings.setpoint').value();
  const measurements = db.get('temperature.measurements').value();

  return {
    fanOn,
    hysteresis,
    inputTemperature,
    lastSync,
    measurements,
    mode,
    outputTemperature,
    setpoint,
  };
};

const setStatus = (
  inputTemperature,
  outputTemperature,
  setpoint,
  hysteresis,
  mode,
  fanOn,
  lastSync
) => {
  db.set('settings.fanOn', fanOn).write();
  db.set('settings.setpoint', setpoint).write();
  db.set('settings.hysteresis', hysteresis).write();
  db.set('settings.mode', mode).write();
  db.set('status.lastSync', lastSync).write();
  db.set('temperature.input', inputTemperature).write();
  db.set('temperature.output', outputTemperature).write();

  const measurements = db.get('temperature.measurements').value();

  if (measurements.length >= MAX_AMOUNT_OF_MEASUREMENTS) {
    measurements.shift();
  }

  measurements.push({
    inputTemperature,
    outputTemperature,
    time: lastSync,
  });

  db.set('temperature.measurements', measurements).write();
};

module.exports = {
  getStatus,
  setStatus,
};
