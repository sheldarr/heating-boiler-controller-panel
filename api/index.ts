import axios from 'axios';

export type ControllerMode = 'FORCED_FAN_OFF' | 'FORCED_FAN_ON' | 'NORMAL';

export interface ControllerStatus {
  fanOn: boolean;
  hysteresis: number;
  inputTemperature: number;
  lastSync: string;
  mode: ControllerMode;
  outputTemperature: number;
  setpoint: number;
}

export interface ControllerMeasurement {
  inputTemperature: number;
  outputTemperature: number;
  time: string;
}

export interface ControllerSettings {
  hysteresis: number;
  mode: ControllerMode;
  setpoint: number;
}

export const getControllerStatus = async () => {
  return axios
    .get<ControllerStatus>('/api/controller/status')
    .then(({ data }) => data);
};

export const setControllerSettings = async (settings: ControllerSettings) => {
  return axios.post<void>('/api/controller/settings', settings);
};
