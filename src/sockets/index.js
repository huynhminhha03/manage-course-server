// const WebSocket = require('ws');

// // Tạo WebSocket server
// const wss = new WebSocket.Server({ port: 8081 });

// // Khi một client kết nối đến server
// wss.on('connection', (ws) => {
//     console.log('Client connected');

//     ws.on('message', (message) => {
//         console.log('Received:', message);
//         wss.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(message);
//             }
//         });
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

// // Export WebSocket server
// module.exports = wss;
