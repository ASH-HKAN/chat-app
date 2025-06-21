<template>
  <div class="messages-container" ref="messageContainer">
    <MessageItem
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      :current-username="currentUsername"
      @reply="(m) => $emit('reply', m)"
      @scrollTo="(m) => $emit('scrollTo', m)"
    />
    <div class="typing-indicator" :class="{ show: typingIndicator }">
      <div class="typing-bubble">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessageItem from "./MessageItem.vue";

export default {
  name: "MessageList",
  props: ["messages", "currentUsername"],
  components: { MessageItem },
  data() {
    return {
      typingIndicator: false,
    };
  },
  methods: {
    scrollToReply(replyTo) {
      const match = this.messages.find((m) => {
        if (!replyTo) return false;
        if (m.user !== replyTo.user) return false;
        if (replyTo.text && m.text === replyTo.text) return true;
        if (replyTo.audio && m.audio === replyTo.audio) return true;
        return false;
      });
      if (match?.id) {
        const el = document.getElementById("msg-" + match.id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          el.classList.add("highlight");
          setTimeout(() => el.classList.remove("highlight"), 1500);
        }
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    setTypingIndicator(isTyping) {
      this.typingIndicator = isTyping;
      if (isTyping) this.scrollToBottom();
    },
  },
};
</script>

<style scoped>
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(135deg, #0e1621 0%, #1a252f 100%);
}

.typing-indicator {
  display: none;
  align-items: center;
  margin-bottom: 15px;
}

.typing-indicator.show {
  display: flex;
}

.typing-bubble {
  background: #242f3d;
  border-radius: 18px;
  padding: 12px 16px;
  margin-left: 0;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #8596a8;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #2e3a47;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3e4a57;
}
</style>