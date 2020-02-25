import axios from 'axios';

type ControllerMode = 'FORCED_FAN_OFF' | 'FORCED_FAN_ON' | 'NORMAL';

export type ControllerStatus = {
  fanOn: boolean;
  hysteresis: number;
  inputTemperature: number;
  lastSync: string;
  mode: ControllerMode;
  outputTemperature: number;
  setpoint: number;
};

export type ControllerMeasurement = {
  inputTemperature: number;
  outputTemperature: number;
  time: string;
};

export const getControllerStatus = async () => {
  return axios
    .get<ControllerStatus>('/api/controller/status')
    .then(({ data }) => data);
};
