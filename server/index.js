const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 1e7, // Support large audio payloads
});

const users = new Map();
const messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setUsername", (username) => {
    users.set(socket.id, {
      id: socket.id,
      name: username,
      online: true,
      gradient: randomGradient(),
      lastMessage: "",
      time: "",
      unread: 0,
    });
    io.emit("userList", Array.from(users.values()));
  });

  socket.on("chatMessage", (msg) => {
    msg.id = Date.now() + Math.random();
    messages.push(msg);
    io.emit("chatMessage", msg);
    const user = users.get(socket.id);
    if (user) {
      user.lastMessage = msg.text || "[Voice Message]";
      user.time = msg.time;
      io.emit("userList", Array.from(users.values()));
    }
  });

  socket.on("typing", ({ user, isTyping }) => {
    socket.broadcast.emit("typing", { user, isTyping });
  });

  socket.on("joinChat", (userId) => {
    socket.join(userId);
    io.to(socket.id).emit("initMessages", messages);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    users.delete(socket.id);
    io.emit("userList", Array.from(users.values()));
  });

  io.to(socket.id).emit("initMessages", messages);
  io.to(socket.id).emit("userList", Array.from(users.values()));
});

function randomGradient() {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
}

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
