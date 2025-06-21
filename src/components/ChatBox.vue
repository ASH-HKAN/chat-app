<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card class="chat-box" outlined>
      <!-- Header -->
      <v-toolbar color="deep-purple accent-4" dark flat dense>
        <v-toolbar-title>💬 Chat Room</v-toolbar-title>
        <v-spacer></v-spacer>
        <div class="subtitle-2">{{ displayUsername }}</div>
      </v-toolbar>

      <!-- Message Area -->
      <v-card-text class="chat-messages" ref="messageContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :id="'msg-' + index"
          :class="[
            'chat-message',
            isOwnMessage(message) ? 'own-message' : 'other-message',
          ]"
        >
          <div class="message-content">
            <!-- Reply toggle button -->
            <v-btn
              icon
              small
              class="reply-btn"
              @click="setReplyMessage(message)"
              :title="'Reply to ' + message.user"
            >
              <v-icon small>mdi-reply</v-icon>
            </v-btn>

            <!-- Replied message snippet inside message -->
            <div
              v-if="message.replyTo"
              class="replied-message clickable"
              @click="scrollToRepliedMessage(message.replyTo)"
              :title="'Go to message by ' + message.replyTo.user"
            >
              <small
                >↪ Reply to <strong>{{ message.replyTo.user }}</strong
                >:</small
              >
              <div v-if="message.replyTo.text" class="reply-text">
                {{ message.replyTo.text }}
              </div>
              <div v-else-if="message.replyTo.audio">🎙 Voice message</div>
            </div>

            <span class="font-weight-bold text--primary"
              >{{ message.user }}:</span
            >
            <span class="ml-2" v-if="message.text">{{ message.text }}</span>
            <audio
              v-if="message.audio"
              :src="message.audio"
              controls
              class="ml-2"
            />
          </div>
        </div>
      </v-card-text>

      <!-- Reply preview above input -->
      <v-card-text v-if="replyMessage" class="reply-preview">
        <v-chip close @click:close="clearReply">
          Replying to <strong>{{ replyMessage.user }}</strong
          >:
          <span v-if="replyMessage.text"> {{ replyMessage.text }}</span>
          <span v-else>🎙 Voice message</span>
        </v-chip>
      </v-card-text>

      <!-- Audio Preview -->
      <v-card-text v-if="audioUrl" class="audio-preview">
        <audio :src="audioUrl" controls></audio>
      </v-card-text>

      <!-- Inputs -->
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

        <v-btn
          color="red darken-1"
          dark
          @click="toggleRecording"
          :loading="loading"
        >
          {{ isRecording ? (isPaused ? "Resume" : "Pause") : "Record" }}
        </v-btn>

        <v-btn
          color="grey darken-1"
          dark
          @click="stopRecording"
          :disabled="!isRecording"
        >
          Stop
        </v-btn>

        <v-btn
          color="green darken-1"
          dark
          @click="sendVoiceMessage"
          :disabled="!audioBlob"
        >
          Send Voice
        </v-btn>

        <v-btn
          color="deep-purple accent-4"
          dark
          @click="sendMessage"
          :disabled="!newMessage.trim()"
        >
          Send
        </v-btn>
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
      loading: false,
      replyMessage: null, // Message object being replied to
    };
  },
  computed: {
    displayUsername() {
      return this.localUsername || "Guest";
    },
  },
  mounted() {
    this.socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
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
            if (e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };

          this.mediaRecorder.onpause = () => {
            this.isPaused = true;
          };

          this.mediaRecorder.onresume = () => {
            this.isPaused = false;
          };

          this.mediaRecorder.start();
          this.isRecording = true;
          this.isPaused = false;
          this.audioBlob = null;
          if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
          }
        } catch (err) {
          console.error("Could not start recording:", err);
        }
      } else {
        if (this.isPaused) {
          this.mediaRecorder.resume();
        } else {
          this.mediaRecorder.pause();
        }
      }
    },

    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
          }
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

        // Cleanup
        this.audioBlob = null;
        if (this.audioUrl) {
          URL.revokeObjectURL(this.audioUrl);
          this.audioUrl = null;
        }
        this.clearReply();
      };
      reader.readAsDataURL(this.audioBlob);
    },

    scrollToRepliedMessage(replyTo) {
      // Find the index of the message being replied to
      const targetIndex = this.messages.findIndex((msg) => {
        // Compare user + text + audio to identify the message uniquely
        return (
          msg.user === replyTo.user &&
          ((msg.text && replyTo.text && msg.text === replyTo.text) ||
            (msg.audio && replyTo.audio && msg.audio === replyTo.audio))
        );
      });

      if (targetIndex !== -1) {
        const container = this.$refs.messageContainer;
        const targetEl = document.getElementById("msg-" + targetIndex);
        if (container && targetEl) {
          // Smooth scroll so the message is visible near the top
          const containerRect = container.getBoundingClientRect();
          const targetRect = targetEl.getBoundingClientRect();
          const offset =
            targetRect.top - containerRect.top + container.scrollTop - 20; // 20px padding
          container.scrollTo({
            top: offset,
            behavior: "smooth",
          });
          // Optionally, highlight the target message briefly
          targetEl.classList.add("highlight");
          setTimeout(() => {
            targetEl.classList.remove("highlight");
          }, 1500);
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
  margin-bottom: 8px;
  word-wrap: break-word;
  position: relative;
  padding: 10px;
  border-radius: 8px;
  max-width: 75%;
  clear: both;
}
.chat-message.own-message {
  background-color: #673ab7;
  color: white;
  margin-left: auto;
  text-align: right;
}
.chat-message.other-message {
  background-color: #e0e0e0;
  color: black;
  margin-right: auto;
  text-align: left;
}
.reply-btn {
  position: absolute;
  top: 4px;
  left: 4px;
  color: #3f51b5;
  opacity: 0.7;
  transition: opacity 0.2s;
  z-index: 10;
  cursor: pointer;
}
.own-message .reply-btn {
  left: auto;
  right: 4px;
}
.reply-btn:hover {
  opacity: 1;
}

.replied-message {
  background: rgba(255 255 255 / 0.3);
  border-left: 3px solid #311b92;
  margin-bottom: 6px;
  padding-left: 6px;
  font-size: 0.8em;
  color: #311b92;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.reply-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-preview {
  padding: 5px 10px;
  border-left: 4px solid #673ab7;
  background: #f3e5f5;
  margin-bottom: 8px;
  max-width: 90%;
}

.audio-preview {
  padding: 10px;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
}

/* Highlight effect when scrolling to replied message */
.highlight {
  animation: highlight-bg 1.5s ease forwards;
}

@keyframes highlight-bg {
  0% {
    background-color: yellow;
  }
  100% {
    background-color: transparent;
  }
}
</style>
