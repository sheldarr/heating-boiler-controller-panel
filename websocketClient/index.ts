let ws;

const callbacksFns = [];

export const registerCallback = (callback) => {
  callbacksFns.push(callback);
};

const connect = () => {
  ws = new WebSocket(
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
      location.host
    }/websocket`
  );

  ws.onopen = function() {
    console.log('Socket is open.');
  };

  ws.onmessage = (event) => {
    callbacksFns.forEach((callback) => callback(event));
  };

  ws.onclose = function(e) {
    console.log(
      'Socket is closed. Reconnect will be attempted in 5 seconds.',
      e.reason
    );

    setTimeout(function() {
      connect();
    }, 5000);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');

    ws.close();
  };
};

if (typeof window !== 'undefined') {
  connect();
}

export default ws;
