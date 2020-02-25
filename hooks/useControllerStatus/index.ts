import { useEffect, useState } from 'react';

import { getControllerStatus, ControllerStatus } from '../../api';

export default (): [ControllerStatus | undefined, () => void] => {
  const [controllerStatus, setControllerStatus] = useState<ControllerStatus>();

  const fetchControllerStatus = async (): Promise<void> => {
    const freshControllerStatus: ControllerStatus = await getControllerStatus();

    setControllerStatus(freshControllerStatus);
  };

  useEffect((): void => {
    fetchControllerStatus();
  }, []);

  return [controllerStatus, fetchControllerStatus];
};
