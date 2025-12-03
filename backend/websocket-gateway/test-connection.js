const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  
  const message = {
    type: 'REGISTER_USER',
    payload: { username: 'brianm' }
  };
  
  ws.send(JSON.stringify(message));
});

ws.on('message', function incoming(data) {
  console.log('Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});

ws.on('close', function close() {
  console.log('Connection closed');
});