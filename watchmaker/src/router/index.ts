import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RepairsView from '@/views/RepairsView.vue'
import MyWorkView from '@/views/MyWorkView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  ],
})

export default router
