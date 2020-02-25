import Sarus from '@anephenix/sarus';

const callbacksFns: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [eventName: string]: ((data: any) => void)[];
} = {};
let sarus = null;

const initialize = () => {
  if (!process.browser) {
    return;
  }

  sarus = new Sarus({
    eventListeners: {
      close: [
        () => {
          console.log('Socket is closed.');
        },
      ],
      error: [
        (error) => {
          console.error('Socket encountered error: ', error);
        },
      ],
      message: [
        (event) => {
          if (document.hidden) {
            console.log('Skipping websocket event');
          }

          if (!event.data) {
            console.error('Missing event data');
            return;
          }

          const data = JSON.parse(event.data);

          const eventName = data.eventName;

          if (!eventName) {
            console.error('Missing event name');
            return;
          }

          if (callbacksFns[eventName]) {
            callbacksFns[eventName].forEach((callback) => callback(data));
          }
        },
      ],
      open: [
        () => {
          console.log('Socket is open.');
        },
      ],
    },
    reconnectAutomatically: true,
    url: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
      location.host
    }/websocket`,
  });
};

initialize();

export const registerCallback = <T>(
  eventName: string,
  callback: (data: T) => void
) => {
  if (!callbacksFns[eventName]) {
    callbacksFns[eventName] = [];
  }

  callbacksFns[eventName].push(callback);
};

export default sarus;
