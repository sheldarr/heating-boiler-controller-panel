import axios from 'axios';
import useSWR from 'swr';

import { ControllerStatus } from '../../api';
import { WebSocketEvents } from '../../events';
import useSocket from '../useSocket';

const fetcher = (url: string) =>
  axios.get<ControllerStatus>(url).then(({ data }) => data);

const useStatus = () => {
  const response = useSWR('/api/controller/status', fetcher);

  useSocket(WebSocketEvents.REFRESH_STATUS, () => {
    response.mutate();
  });

  return response;
};

export default useStatus;
