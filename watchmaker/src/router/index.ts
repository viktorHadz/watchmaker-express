import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RepairsView from '@/views/RepairsView.vue'
import MyWorkView from '@/views/MyWorkView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import LoginPanel from '@/views/Admin/LoginPanel.vue'
import EditorView from '@/views/Admin/EditorView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useAuth } from '@/composables/useAuth'

const requireAuthenticatedAdmin = async (to: RouteLocationNormalized) => {
  const { refreshUser, isAuthenticated } = useAuth()

  await refreshUser()

  if (!isAuthenticated.value) {
    return {
      name: 'admin',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  return true
}

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
      component: PostDetailView,
      props: true,
    },
    {
      path: '/admin',
      name: 'admin',
      component: LoginPanel,
    },
    {
      path: '/admin/editor/:postId?',
      name: 'adminEditor',
      component: EditorView,
      props: true,
      beforeEnter: requireAuthenticatedAdmin,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
    },
  ],
  scrollBehavior() {
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
