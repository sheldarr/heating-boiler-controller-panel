/* eslint-disable @typescript-eslint/no-var-requires */

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const MAX_AMOUNT_OF_MEASUREMENTS = 3;

db.defaults({
  'settings.fanOn': false,
  'settings.hysteresis': 2,
  'settings.mode': 'NORMAL',
  'settings.setpoint': 40,
  'status.lastSync': new Date(),
  'temperature.input': 0,
  'temperature.inputMeasurements': [],
  'temperature.output': 0,
  'temperature.outputMeasurements': [],
}).write();

const getStatus = () => {
  const fanOn = db.get('settings.fanOn').value();
  const hysteresis = db.get('settings.hysteresis').value();
  const inputTemperature = db.get('temperature.input').value();
  const lastSync = db.get('status.lastSync').value();
  const mode = db.get('settings.mode').value();
  const outputTemperature = db.get('temperature.output').value();
  const setpoint = db.get('settings.setpoint').value();
  const inputMeasurements = db.get('temperature.inputMeasurements').value();
  const outputMeasurements = db.get('temperature.outputMeasurements').value();

  return {
    fanOn,
    hysteresis,
    inputMeasurements,
    inputTemperature,
    lastSync,
    mode,
    outputMeasurements,
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

  const inputMeasurements = db.get('temperature.inputMeasurements').value();

  if (inputMeasurements.length >= MAX_AMOUNT_OF_MEASUREMENTS) {
    inputMeasurements.shift();
  }

  inputMeasurements.push({
    time: lastSync,
    value: inputTemperature,
  });

  db.set('temperature.inputMeasurements', inputMeasurements).write();

  const outputMeasurements = db.get('temperature.outputMeasurements').value();

  if (outputMeasurements.length >= MAX_AMOUNT_OF_MEASUREMENTS) {
    outputMeasurements.shift();
  }

  outputMeasurements.push({
    time: lastSync,
    value: outputTemperature,
  });

  db.set('temperature.outputMeasurements', outputMeasurements).write();
};

module.exports = {
  getStatus,
  setStatus,
};
