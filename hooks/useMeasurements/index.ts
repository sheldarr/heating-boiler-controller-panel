import axios from 'axios';
import useSWR from 'swr';

import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';

interface Measurement {
  inputTemperature: number;
  outputTemperature: number;
  time: string;
}

const fetcher = (url: string) =>
  axios.get<Measurement[]>(url).then(({ data }) => data);

const useStatus = () => {
  const response = useSWR('/api/controller/measurements', fetcher);

  useSocket(WebSocketEvents.REFRESH_MEASUREMENTS, () => {
    response.mutate();
  });

  return response;
};

export default useStatus;
