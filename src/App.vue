<template>
  <div id="app">
    <h1>Chat App</h1>
    <ChatBox />
  </div>
</template>

<script>
import ChatBox from './components/ChatBox.vue';

export default {
  name: 'App',
  components: {
    ChatBox,
  },
};
</script>

<style>
#app {
  text-align: center;
  font-family: Arial, sans-serif;
}
</style>