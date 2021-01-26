import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import differenceInSeconds from 'date-fns/differenceInSeconds';

type Mode = 'NORMAL' | 'FORCED_FAN_OFF' | 'FORCED_FAN_ON';

export type Trend = 'DOWN' | 'UP' | 'UNKNOWN';

export interface Measurement {
  inputTemperature: number;
  outputTemperature: number;
  setpoint: number;
  time: string;
  trend: Trend;
}

export interface Settings {
  fanOn: boolean;
  hysteresis: number;
  lastSync: string;
  mode: Mode;
  setpoint: number;
}

interface Database {
  measurements: Measurement[];
  settings: Settings;
}

const getDatabase = () => {
  const adapter = new FileSync<Database>('db.json');
  const db = low(adapter);

  db.defaults({
    measurements: [],
    settings: {
      fanOn: false,
      hysteresis: 2,
      lastSync: new Date(),
      mode: 'NORMAL',
      setpoint: 40,
    },
    trend: 'UNKNOWN',
  }).write();

  return db;
};

export const getSettings = () => {
  const db = getDatabase();

  return db.get('settings').value();
};

export const getMeasurements = () => {
  const db = getDatabase();

  return db.get('measurements').value();
};

export const setSettings = (settings: Settings) => {
  const db = getDatabase();

  db.set('settings', settings).write();
};

export const addMeasurement = (measurement: Measurement) => {
  const db = getDatabase();

  const measurements = db.get('measurements').value();
  const [lastMeasurement] = measurements.slice(-1);

  if (lastMeasurement) {
    if (lastMeasurement.trend === 'UP' || lastMeasurement.trend === 'UNKNOWN') {
      if (measurement.outputTemperature < lastMeasurement.outputTemperature) {
        measurement.trend = 'DOWN';
      }
    }

    if (
      lastMeasurement.trend === 'DOWN' ||
      lastMeasurement.trend === 'UNKNOWN'
    ) {
      if (measurement.outputTemperature > lastMeasurement.outputTemperature) {
        measurement.trend = 'UP';
      }
    }

    if (measurement.trend === 'UNKNOWN') {
      measurement.trend = lastMeasurement.trend;
    }
  }

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

    measurements.push(measurement);

    db.set('measurements', measurements).write();
  }
};
