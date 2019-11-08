let ws;

const connect = () => {
  ws = new WebSocket(
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
      location.host
    }/websocket`
  );

  ws.onopen = function() {
    console.log('Socket is open.');
  };

  ws.onclose = function(e) {
    console.log(
      'Socket is closed. Reconnect will be attempted in 1 second.',
      e.reason
    );

    setTimeout(function() {
      connect();
    }, 1000);
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
