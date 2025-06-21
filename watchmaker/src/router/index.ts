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
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
