import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RepairsView from '@/views/RepairsView.vue'
import MyWorkView from '@/views/MyWorkView.vue'
import LoginPanel from '@/views/Admin/LoginPanel.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/repairs',
      name: 'repairs',
      component: RepairsView,
    },
    {
      path: '/my-work',
      name: 'myWork',
      component: MyWorkView,
    },
    {
      path: '/my-work/:postId',
      name: 'postDetail',
      component: MyWorkView,
      props: true,
      // Add meta for sharing
      meta: {
        requiresPost: true,
      },
    },
    {
      path: '/admin',
      name: 'admin',
      component: LoginPanel,
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Target the scrollable container instead of window
    return new Promise((resolve) => {
      setTimeout(() => {
        const scrollContainer = document.querySelector('#app-scroll-container')
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
        resolve({ top: 0 })
      }, 50)
    })
  },
})

export default router
