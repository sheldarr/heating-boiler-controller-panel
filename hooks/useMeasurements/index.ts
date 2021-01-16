import axios from 'axios';
import useSWR from 'swr';
import { format } from 'date-fns';

import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';
import { Measurement } from '../../database';

const fetcher = (url: string) =>
  axios.get<Measurement[]>(url).then(({ data }) =>
    data.map((measurement) => ({
      ...measurement,
      time: format(new Date(measurement.time), 'HH:mm:ss'),
    })),
  );

const useMeasurements = () => {
  const response = useSWR('/api/controller/measurements', fetcher);

  useSocket(WebSocketEvents.REFRESH_MEASUREMENTS, () => {
    response.mutate();
  });

  return response;
};

export default useMeasurements;
