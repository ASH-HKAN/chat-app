const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080', // Allow requests from Vue dev server
    methods: ['GET', 'POST'], // Allow these HTTP methods
    credentials: true, // Optional, if you use cookies or auth
  },
});

app.use(express.static('../chat-app/dist')); // Serve Vue app (for production)

io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg); // Broadcast message to all
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});