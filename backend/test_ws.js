const WebSocket = require('ws');
const ws = new WebSocket('ws://127.0.0.1:8000/ws/live');

ws.on('open', () => {
    console.log('Connected');
    ws.close();
});

ws.on('error', (err) => {
    console.log('Error:', err.message);
});

ws.on('close', () => {
    console.log('Closed');
});
