import axios from 'axios';
import useSWR from 'swr';

import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';
import { ControllerMeasurement } from '../../database';

const fetcher = (url: string) =>
  axios.get<ControllerMeasurement[]>(url).then(({ data }) => data);

const useMeasurements = () => {
  const response = useSWR('/api/controller/measurements', fetcher);

  useSocket(WebSocketEvents.REFRESH_MEASUREMENTS, () => {
    response.mutate();
  });

  return response;
};

export default useMeasurements;
