<template>
  <aside class="sidebar">
    <input type="search" placeholder="Search" class="search-input" />
    <ul class="chat-list">
      <li
        v-for="user in filteredUsers"
        :key="user.id"
        @click="$emit('switchUser', user)"
        :class="{ active: currentUser && user.id === currentUser.id }"
        class="chat-item"
      >
        <div class="avatar-container">
          <img :src="user.avatar" alt="Avatar" class="avatar" />
          <span v-if="user.online" class="online-dot" title="Online"></span>
        </div>
        <div class="chat-info">
          <div class="chat-name-time">
            <h3 class="chat-name">{{ user.name }}</h3>
            <time class="chat-time">{{ user.lastTime }}</time>
          </div>
          <p class="chat-last-message">{{ user.lastMessage }}</p>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    users: Array,
    currentUser: Object,
    searchQuery: String,
  },
  emits: ["switchUser", "update:searchQuery"],
  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users;
      return this.users.filter((u) =>
        u.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  watch: {
    searchQuery(newVal) {
      this.$emit("update:searchQuery", newVal);
    },
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #1a273b;
  width: 280px;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  border-right: 1px solid #2b3a54;
  user-select: none;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border-radius: 40px;
  border: none;
  background-color: #152133;
  color: #728395;
  font-size: 14px;
  outline: none;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.search-input::placeholder {
  color: #728395;
}

.search-input:focus {
  background-color: #1c2b4a;
  color: #fff;
}

.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-item:hover {
  background-color: #2c3a56;
}

.chat-item.active {
  background-color: #4b77d8;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.chat-item.active .avatar {
  border-color: #e4e6f3;
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background-color: #4bc67e;
  border-radius: 50%;
  border: 2px solid #17212b;
}

.chat-info {
  margin-left: 12px;
  flex-grow: 1;
  overflow: hidden;
}

.chat-name-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-name {
  font-weight: 600;
  font-size: 15px;
  color: #e4e6f3;
  margin: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 160px;
}

.chat-time {
  font-size: 12px;
  color: #728395;
}

.chat-last-message {
  font-size: 13px;
  color: #728395;
  margin-top: 4px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 230px;
}
</style>
