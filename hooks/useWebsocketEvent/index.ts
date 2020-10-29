import { registerCallback } from '../../websocketClient';

export default <T>(
  eventName: string,
  callback: (data: T) => void,
): (() => void) => {
  registerCallback(eventName, callback);

  return () => {
    // unregisterCallback(eventName, callback);
  };
};
