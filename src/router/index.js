import Vue from 'vue'
import Router from 'vue-router'
import ChatBox from '@/components/ChatBox.vue' 

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/chat/:username?', // optional username param
      name: 'Chat',
      component: ChatBox,
      props: true, // ✅ enables passing route params as props
    },
  ],
})
