import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import differenceInSeconds from 'date-fns/differenceInSeconds';

type Mode = 'NORMAL' | 'FORCED_FAN_OFF' | 'FORCED_FAN_ON';

export interface Measurement {
  inputTemperature: number;
  outputTemperature: number;
  time: string;
}

interface Database {
  'settings.fanOn': boolean;
  'settings.hysteresis': number;
  'settings.mode': Mode;
  'settings.setpoint': number;
  'status.lastSync': string;
  'temperature.input': number;
  'temperature.measurements': Measurement[];
  'temperature.output': number;
}

const getDatabase = () => {
  const adapter = new FileSync<Database>('db.json');
  const db = low(adapter);

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

  return db;
};

export const getStatus = () => {
  const db = getDatabase();

  const fanOn = db.get('settings.fanOn').value();
  const hysteresis = db.get('settings.hysteresis').value();
  const inputTemperature = db.get('temperature.input').value();
  const lastSync = db.get('status.lastSync').value();
  const mode = db.get('settings.mode').value() as Mode;
  const outputTemperature = db.get('temperature.output').value();
  const setpoint = db.get('settings.setpoint').value();

  return {
    fanOn,
    hysteresis,
    inputTemperature,
    lastSync,
    mode,
    outputTemperature,
    setpoint,
  };
};

export const getMeasurements = () => {
  const db = getDatabase();

  return db.get('temperature.measurements').value();
};

export const setStatus = (
  inputTemperature,
  outputTemperature,
  setpoint,
  hysteresis,
  mode,
  fanOn,
  lastSync,
) => {
  const db = getDatabase();

  db.set('settings.fanOn', fanOn).write();
  db.set('settings.setpoint', setpoint).write();
  db.set('settings.hysteresis', hysteresis).write();
  db.set('settings.mode', mode).write();
  db.set('status.lastSync', lastSync).write();
  db.set('temperature.input', inputTemperature).write();
  db.set('temperature.output', outputTemperature).write();

  const measurements = db.get('temperature.measurements').value();

  const lastMeasurementDate =
    measurements.length && new Date(measurements[measurements.length - 1].time);

  if (
    differenceInSeconds(new Date(), lastMeasurementDate) >=
      Number(process.env.MEASUREMENTS_SKIP_SECONDS) ||
    measurements.length === 0
  ) {
    if (measurements.length >= Number(process.env.MAX_AMOUNT_OF_MEASUREMENTS)) {
      measurements.shift();
    }

    measurements.push({
      inputTemperature,
      outputTemperature,
      time: lastSync,
    });

    db.set('temperature.measurements', measurements).write();
  }
};
