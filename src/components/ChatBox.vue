<template>
  <div class="chat-container">
    <div class="messages">
      <div v-for="(message, index) in messages" :key="index" class="message">
        {{ message.user }}: {{ message.text }}
      </div>
    </div>
    <div class="input-area">
      <input v-model="username" placeholder="Your username" />
      <input v-model="newMessage" placeholder="Type a message..." @keyup.enter="sendMessage" />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'ChatBox',
  data() {
    return {
      socket: io('http://localhost:3000'), // Connect to backend
      messages: [],
      newMessage: '',
      username: '',
    };
  },
  mounted() {
    this.socket.on('chatMessage', (msg) => {
      this.messages.push(msg);
    });
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() && this.username.trim()) {
        const msg = { user: this.username, text: this.newMessage };
        this.socket.emit('chatMessage', msg);
        this.newMessage = ''; // Clear input
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  width: 300px;
  margin: 0 auto;
  border: 1px solid #ccc;
  padding: 10px;
}
.messages {
  height: 300px;
  overflow-y: auto;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}
.message {
  padding: 5px;
  word-wrap: break-word;
}
.input-area {
  display: flex;
  gap: 10px;
}
input {
  flex: 1;
  padding: 5px;
}
button {
  padding: 5px 10px;
}
</style>