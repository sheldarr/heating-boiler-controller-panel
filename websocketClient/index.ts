import Sarus from '@anephenix/sarus';

const callbacksFns = [];
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
          console.error('Socket encountered error: ', error.message);
        },
      ],
      message: [
        (event) => {
          callbacksFns.forEach((callback) => callback(event));
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

export const registerCallback = (callback) => {
  callbacksFns.push(callback);
};

export default sarus;
