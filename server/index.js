// server.js (or your server file)
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST'],
  },
})

// Store messages in memory with IDs
let messages = []
let nextId = 1

io.on('connection', (socket) => {
  console.log('User connected')

  // Send all messages to new client
  socket.emit('initMessages', messages)

  socket.on('chatMessage', (msg) => {
    // Add unique id to the message
    const messageWithId = { ...msg, id: nextId++ }
    messages.push(messageWithId)
    io.emit('chatMessage', messageWithId)
  })

  // Handle delete message request
  socket.on('deleteMessage', (id) => {
    // Remove message by id
    messages = messages.filter((msg) => msg.id !== id)
    io.emit('messageDeleted', id) // notify all clients to delete it
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
