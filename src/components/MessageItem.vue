<template>
  <div :id="'msg-' + message.id" class="message" :class="{ own: isOwn }">
    <div class="message-bubble">
      <div class="message-header">
        <strong>{{ message.user }}</strong>
        <span
          v-if="message.replyTo"
          class="reply-snippet"
          @click="$emit('scrollTo', message.replyTo)"
        >
          ↩️ {{ message.replyTo.text || "[Voice Message]" }}
        </span>
      </div>
      <div class="message-body">
        <span v-if="message.text">{{ message.text }}</span>
        <audio v-if="message.audio" :src="message.audio" controls />
      </div>
      <div class="message-time">{{ message.time }}</div>
      <div class="actions">
        <v-btn icon @click="$emit('reply', message)" title="Reply">
          <v-icon small>mdi-reply</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageItem",
  props: {
    message: Object,
    currentUsername: String,
  },
  computed: {
    isOwn() {
      return this.message.user === this.currentUsername;
    },
  },
};
</script>

<style scoped>
.message {
  display: flex;
  margin-bottom: 15px;
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.message.own .message-bubble {
  background: #3390ec;
  color: white;
  border-bottom-right-radius: 4px;
}

.message:not(.own) .message-bubble {
  background: #242f3d;
  color: #ffffff;
  border-bottom-left-radius: 4px;
}

.message-header {
  font-size: 0.8em;
  margin-bottom: 4px;
}

.reply-snippet {
  cursor: pointer;
  color: #80bfff;
  font-style: italic;
  margin-left: 8px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.message:not(.own) .message-time {
  text-align: left;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}

.highlight {
  animation: highlightFade 1.5s;
  background-color: #ffff99 !important;
}

@keyframes highlightFade {
  from {
    background-color: #ffff99;
  }
  to {
    background-color: inherit;
  }
}
</style>