import axios from 'axios';
import useSWR from 'swr';
import { Settings } from '../../database';

import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';

const fetcher = (url: string) =>
  axios.get<Settings>(url).then(({ data }) => data);

const useSettings = () => {
  const response = useSWR('/api/controller/settings', fetcher);

  useSocket(WebSocketEvents.REFRESH_SETTINGS, () => {
    response.mutate();
  });

  return response;
};

export default useSettings;
