import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RepairsView from '@/views/RepairsView.vue'
import MyWorkView from '@/views/MyWorkView.vue'
import PostDetailView from '@/views/PostDetailView.vue'
import ServiceLandingView from '@/views/ServiceLandingView.vue'
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
      path: '/watch-repair-london',
      name: 'watchRepairLondon',
      component: ServiceLandingView,
      meta: {
        pageKey: 'watchRepairLondon',
      },
    },
    {
      path: '/vintage-watch-repair-london',
      name: 'vintageWatchRepairLondon',
      component: ServiceLandingView,
      meta: {
        pageKey: 'vintageWatchRepairLondon',
      },
    },
    {
      path: '/watch-restoration-london',
      name: 'watchRestorationLondon',
      component: ServiceLandingView,
      meta: {
        pageKey: 'watchRestorationLondon',
      },
    },
    {
      path: '/mechanical-watch-service-london',
      name: 'mechanicalWatchServiceLondon',
      component: ServiceLandingView,
      meta: {
        pageKey: 'mechanicalWatchServiceLondon',
      },
    },
    {
      path: '/pocket-watch-repair-london',
      name: 'pocketWatchRepairLondon',
      component: ServiceLandingView,
      meta: {
        pageKey: 'pocketWatchRepairLondon',
      },
    },
    {
      path: '/watch-repair-by-post',
      name: 'watchRepairByPost',
      component: ServiceLandingView,
      meta: {
        pageKey: 'watchRepairByPost',
      },
    },
    {
      path: '/my-work',
      name: 'myWork',
      component: MyWorkView,
    },
    {
      path: '/my-work/:slug-:postId(\\d+)',
      name: 'postDetail',
      component: PostDetailView,
      props: (route) => ({
        postId: route.params.postId,
        slug: route.params.slug,
      }),
    },
    {
      path: '/my-work/:postId(\\d+)',
      name: 'postDetailLegacy',
      component: PostDetailView,
      props: (route) => ({
        postId: route.params.postId,
        slug: '',
      }),
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
