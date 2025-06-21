<template>
  <div class="input-area">
    <v-text-field
      v-model="internalUsername"
      placeholder="Username"
      dense
      hide-details
      class="message-input username-input"
      style="max-width: 120px"
    />
    <v-textarea
      v-model="newMessage"
      placeholder="Write a message..."
      dense
      hide-details
      class="message-input"
      rows="1"
      auto-grow
      @keydown.enter.prevent="emitTextMessage"
    />
    <v-btn
      color="red darken-1"
      dark
      class="action-btn"
      @click="toggleRecording"
    >
      {{ isRecording ? (isPaused ? "Resume" : "Pause") : "Record" }}
    </v-btn>
    <v-btn
      v-if="audioBlob"
      color="blue darken-3"
      dark
      class="action-btn"
      @click="emitVoiceMessage"
    >
      Send Voice
    </v-btn>
    <v-btn
      color="deep-purple accent-4"
      dark
      class="send-btn"
      @click="emitTextMessage"
      :disabled="!newMessage.trim() || !internalUsername.trim()"
    >
      ➤
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "ChatInput",
  props: {
    replyMessage: Object,
    localUsername: String,
  },
  data() {
    return {
      internalUsername: this.localUsername,
      newMessage: "",
      isRecording: false,
      isPaused: false,
      mediaRecorder: null,
      audioChunks: [],
      audioBlob: null,
      stream: null,
    };
  },
  watch: {
    internalUsername(newVal) {
      this.$emit("update:localUsername", newVal);
    },
    localUsername(newVal) {
      this.internalUsername = newVal;
    },
  },
  methods: {
    emitTextMessage() {
      if (!this.newMessage.trim() || !this.internalUsername.trim()) return;
      this.$emit("sendText", {
        text: this.newMessage,
        replyTo: this.replyMessage || null,
      });
      this.newMessage = "";
      this.$emit("clearReply");
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

          this.mediaRecorder.onstop = () => {
            this.audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
            if (this.stream) {
              this.stream.getTracks().forEach((track) => track.stop());
              this.stream = null;
            }
          };

          this.mediaRecorder.start();
          this.isRecording = true;
          this.isPaused = false;
          this.stream = stream;
        } catch (err) {
          console.error("Error accessing mic:", err);
          alert(
            "Could not access microphone. Please allow microphone permissions."
          );
        }
      } else {
        if (this.isPaused) {
          this.mediaRecorder.resume();
          this.isPaused = false;
        } else {
          this.mediaRecorder.pause();
          this.isPaused = true;
        }
      }
    },
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.isPaused = false;
      }
    },
    emitVoiceMessage() {
      if (!this.audioBlob || !this.internalUsername.trim()) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        this.$emit("sendVoice", {
          audio: base64Audio,
          replyTo: this.replyMessage || null,
        });
        this.audioBlob = null;
        this.$emit("clearReply");
      };
      reader.readAsDataURL(this.audioBlob);
    },
  },
};
</script>

<style scoped>
.input-area {
  padding: 20px;
  background: #17212b;
  border-top: 1px solid #2e3a47;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.message-input {
  background: #242f3d;
  border: none;
  border-radius: 22px;
  padding: 12px 20px;
  color: #ffffff;
  font-size: 14px;
}

.message-input::placeholder {
  color: #8596a8;
}

.username-input {
  max-width: 120px;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: #3390ec;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.send-btn:hover {
  background: #2b7cd6;
}

.send-btn:disabled {
  background: #8596a8;
  cursor: not-allowed;
}

.action-btn {
  background: none;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.action-btn:hover {
  background: #242f3d;
}
</style>