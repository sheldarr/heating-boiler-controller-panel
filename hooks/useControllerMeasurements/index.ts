import { useEffect, useState } from 'react';

import { getControllerMeasurements, ControllerMeasurement } from '../../api';

export default (): [ControllerMeasurement[], () => Promise<void>] => {
  const [controllerMeasurements, setControllerMeasurements] = useState<
    ControllerMeasurement[]
  >([]);

  const fetchControllerMeasurements = async (): Promise<void> => {
    const freshControllerMeasurements: ControllerMeasurement[] = await getControllerMeasurements();

    setControllerMeasurements(freshControllerMeasurements);
  };

  useEffect((): void => {
    fetchControllerMeasurements();
  }, []);

  return [controllerMeasurements, fetchControllerMeasurements];
};
