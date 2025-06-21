<template>
  <section class="chat-main">
    <header class="chat-header">
      <div class="header-info">
        <img :src="currentUser.avatar" alt="Avatar" class="avatar" />
        <div class="header-text">
          <h2>{{ currentUser.name }}</h2>
          <small :class="{ online: currentUser.online }">
            {{ currentUser.online ? "Online" : "Offline" }}
          </small>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn icon-btn" title="Video Call">
          <svg
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </button>
        <button class="btn icon-btn" title="Phone Call">
          <svg
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.21.37 2.39.72 3.52a2 2 0 0 1-.45 2.11L9.91 10a16 16 0 0 0 6 6l1.65-1.65a2 2 0 0 1 2.11-.45c1.13.35 2.31.59 3.52.72A2 2 0 0 1 22 16.92z"
            ></path>
          </svg>
        </button>
        <button class="btn icon-btn" title="More Options">
          <svg
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
    </header>

    <MessageList :messages="messages" :localUsername="localUsername" />

    <MessageInput @sendMessage="$emit('sendMessage', $event)" />
  </section>
</template>

<script>
import MessageList from "./MessageList.vue";
import MessageInput from "./MessageInput.vue";

export default {
  props: {
    currentUser: Object,
    messages: Array,
    localUsername: String,
  },
  emits: ["sendMessage", "update:localUsername"],
  components: { MessageList, MessageInput },
};
</script>

<style scoped>
.chat-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #1f2d47;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 25px;
  border-bottom: 1px solid #344366;
  align-items: center;
  background-color: #17212b;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.header-text h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #e4e6f3;
}

.header-text small {
  font-size: 12px;
  font-weight: 400;
  color: #728395;
}

.header-text small.online {
  color: #4bc67e;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.btn {
  cursor: pointer;
  border: none;
  background: none;
  color: #728395;
  padding: 6px;
  border-radius: 50%;
  transition: color 0.3s, background-color 0.3s;
}

.btn:hover {
  background-color: #243754;
  color: #e4e6f3;
}

.icon-btn svg {
  display: block;
}
</style>
