import axios from 'axios';

export type ControllerMode = 'FORCED_FAN_OFF' | 'FORCED_FAN_ON' | 'NORMAL';

export interface ControllerStatus {
  fanOn: boolean;
  hysteresis: number;
  inputTemperature: number;
  lastSync: string | Date;
  mode: ControllerMode;
  outputTemperature: number;
  setpoint: number;
}

export interface ControllerSettings {
  hysteresis: number;
  mode: ControllerMode;
  setpoint: number;
}

export const setControllerSettings = async (settings: ControllerSettings) => {
  return axios.post<void>('/api/controller/settings', settings);
};
