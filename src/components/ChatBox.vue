<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="chat-box" outlined>
      <!-- Header -->
      <v-toolbar color="deep-purple accent-4" dark flat dense>
        <v-toolbar-title>💬 Chat Room</v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="subtitle-2">{{ displayUsername }}</div>
      </v-toolbar>

      <!-- Messages -->
      <v-card-text class="chat-messages" ref="messageContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :id="'msg-' + message.id"
          :class="['chat-message', { 'own-message': isOwnMessage(message) }]"
        >
          <!-- Reply Preview -->
          <div
            v-if="message.replyTo"
            class="reply-preview"
            @click="scrollToRepliedMessage(message.replyTo)"
          >
            <small class="text-muted">↪ {{ message.replyTo.user }}:</small>
            <div v-if="message.replyTo.text">{{ message.replyTo.text }}</div>
            <audio
              v-if="message.replyTo.audio"
              :src="message.replyTo.audio"
              controls
              class="ml-2"
            />
          </div>

          <!-- Main Message -->
          <div @click="setReplyMessage(message)">
            <strong>{{ message.user }}:</strong>
            <span v-if="message.text"> {{ message.text }}</span>
            <audio
              v-if="message.audio"
              :src="message.audio"
              controls
              class="ml-2"
            />
          </div>

          <!-- Delete Button -->
          <v-btn
            v-if="isOwnMessage(message)"
            icon
            small
            color="red"
            @click="confirmDelete(message.id)"
          >
            🗑
          </v-btn>
        </div>
      </v-card-text>

      <!-- Reply Preview Input -->
      <div v-if="replyMessage" class="reply-input">
        <small>Replying to {{ replyMessage.user }}:</small>
        <div>{{ replyMessage.text || "Voice message" }}</div>
        <v-btn icon @click="clearReply">❌</v-btn>
      </div>

      <!-- Input Controls -->
      <v-card-actions class="pa-2">
        <v-text-field
          v-model="localUsername"
          label="Username"
          dense
          hide-details
          outlined
          class="mr-2"
          style="max-width: 120px"
        />
        <v-text-field
          v-model="newMessage"
          label="Type a message..."
          dense
          hide-details
          outlined
          class="flex-grow-1"
          @keyup.enter="sendMessage"
        />

        <v-btn color="red darken-1" dark @click="toggleRecording">
          {{ isRecording ? (isPaused ? "Resume" : "Pause") : "Record" }}
        </v-btn>
        <v-btn color="orange" dark @click="stopRecording">Stop</v-btn>
        <v-btn color="green" dark @click="sendVoiceMessage">Send Voice</v-btn>
        <v-btn color="deep-purple accent-4" dark @click="sendMessage"
          >Send</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import io from "socket.io-client";

export default {
  name: "ChatBox",
  data() {
    return {
      socket: io("http://localhost:3000"),
      messages: [],
      newMessage: "",
      localUsername: "",
      isRecording: false,
      isPaused: false,
      mediaRecorder: null,
      audioChunks: [],
      audioBlob: null,
      audioUrl: null,
      replyMessage: null,
    };
  },
  computed: {
    displayUsername() {
      return this.localUsername || "Guest";
    },
  },
  mounted() {
    this.socket.on("initMessages", (msgs) => {
      this.messages = msgs;
    });
    this.socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        if (container) container.scrollTop = container.scrollHeight;
      });
    });
    this.socket.on("messageDeleted", (id) => {
      this.messages = this.messages.filter((msg) => msg.id !== id);
    });
  },
  methods: {
    isOwnMessage(message) {
      return message.user === this.localUsername;
    },
    setReplyMessage(message) {
      this.replyMessage = message;
    },
    clearReply() {
      this.replyMessage = null;
    },
    confirmDelete(id) {
      if (confirm("Are you sure you want to delete this message?")) {
        this.socket.emit("deleteMessage", id);
      }
    },
    sendMessage() {
      if (this.newMessage.trim() && this.localUsername.trim()) {
        const msg = {
          user: this.localUsername,
          text: this.newMessage,
          replyTo: this.replyMessage
            ? {
                user: this.replyMessage.user,
                text: this.replyMessage.text,
                audio: this.replyMessage.audio || null,
              }
            : null,
        };
        this.socket.emit("chatMessage", msg);
        this.newMessage = "";
        this.clearReply();
      }
    },
    async toggleRecording() {
      if (!this.isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          this.mediaRecorder = new MediaRecorder(stream);
          this.audioChunks = [];
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.audioChunks.push(e.data);
          };
          this.mediaRecorder.start();
          this.isRecording = true;
          this.isPaused = false;
        } catch (err) {
          console.error("Could not start recording:", err);
        }
      } else {
        this.isPaused
          ? this.mediaRecorder.resume()
          : this.mediaRecorder.pause();
        this.isPaused = !this.isPaused;
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
          this.audioUrl = URL.createObjectURL(this.audioBlob);
        };
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.isPaused = false;
      }
    },
    sendVoiceMessage() {
      if (!this.audioBlob || !this.localUsername.trim()) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        const msg = {
          user: this.localUsername,
          audio: base64Audio,
          replyTo: this.replyMessage
            ? {
                user: this.replyMessage.user,
                text: this.replyMessage.text,
                audio: this.replyMessage.audio || null,
              }
            : null,
        };
        this.socket.emit("chatMessage", msg);
        this.audioBlob = null;
        if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
        this.audioUrl = null;
        this.clearReply();
      };
      reader.readAsDataURL(this.audioBlob);
    },
    scrollToRepliedMessage(replyTo) {
      const id = this.messages.find((m) => {
        if (!replyTo) return false;
        if (m.user !== replyTo.user) return false;
        if (replyTo.text && m.text === replyTo.text) return true;
        if (replyTo.audio && m.audio === replyTo.audio) return true;
        return false;
      })?.id;

      if (id) {
        const container = this.$refs.messageContainer;
        const targetEl = document.getElementById("msg-" + id);
        if (container && targetEl) {
          container.scrollTo({
            top: targetEl.offsetTop - container.offsetTop,
            behavior: "smooth",
          });
          targetEl.classList.add("highlight");
          setTimeout(() => targetEl.classList.remove("highlight"), 1500);
        }
      }
    },
  },
};
</script>

<style scoped>
.chat-box {
  width: 500px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}
.chat-messages {
  height: 350px;
  overflow-y: auto;
  background: #fafafa;
  padding: 10px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
.chat-message {
  margin-bottom: 12px;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.own-message {
  text-align: right;
  background-color: #e3f2fd;
}
.reply-preview {
  background: #f0f0f0;
  padding: 4px 6px;
  border-left: 3px solid #ccc;
  margin-bottom: 4px;
  font-size: 0.85em;
}
.reply-input {
  padding: 6px 10px;
  background: #f9f9f9;
  border-left: 3px solid #333;
  margin: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.highlight {
  animation: highlight-glow 1.5s ease-out;
  background-color: #ffeaa7;
  border-radius: 5px;
}
@keyframes highlight-glow {
  0% {
    background-color: #ffeaa7;
  }
  100% {
    background-color: transparent;
  }
}
</style>
