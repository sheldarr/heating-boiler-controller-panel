import axios from 'axios';
import useSWR from 'swr';

import { Trend } from '../../database';
import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';

const fetcher = (url: string) => axios.get<Trend>(url).then(({ data }) => data);

const useMeasurements = () => {
  const response = useSWR('/api/controller/trend', fetcher);

  useSocket(WebSocketEvents.REFRESH_MEASUREMENTS, () => {
    response.mutate();
  });

  return response;
};

export default useMeasurements;
