<script setup>
import { ref, onMounted, onUnmounted, computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  WrenchIcon,
} from '@heroicons/vue/24/outline'
import DarkMode from './DarkMode.vue'
import { onClickOutside } from '@vueuse/core'

import ToolTip from './ToolTip.vue'

const isVisible = ref(true) // menu
const lastScrollY = ref(0)
const scrollThreshold = 10
let scrollElement = null
const handleScroll = () => {
  if (!scrollElement) return

  const currentScrollY = scrollElement.scrollTop

  // Always show when at top
  if (currentScrollY <= 50) {
    isVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }

  // Only trigger if scrolled more than threshold
  if (Math.abs(currentScrollY - lastScrollY.value) < scrollThreshold) {
    return
  }

  // Hide when scrolling down, show when scrolling up
  if (currentScrollY > lastScrollY.value) {
    isVisible.value = false // Scrolling down
  } else {
    isVisible.value = true // Scrolling up
  }

  lastScrollY.value = currentScrollY
}

const router = useRouter()
const { user, isAuthenticated } = useAuth()
const avatarUrl = computed(() => `${user.value?.avatar}` || '/default-avatar.png')
onMounted(() => {
  // Find the actual scrolling container (the div with overflow-y-auto)
  scrollElement = document.querySelector('.overflow-y-auto')
  if (scrollElement) {
    scrollElement.addEventListener('scroll', handleScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (scrollElement) {
    scrollElement.removeEventListener('scroll', handleScroll)
  }
})

const toolRef = useTemplateRef('tooltip-ref')
const toolVisible = ref(false)
onClickOutside(toolRef, () => {
  toolVisible.value = false
})
function showTool() {
  toolVisible.value = !toolVisible.value
  console.log('showTool: ', toolVisible.value)
}
function toolNewPostNav() {
  router.push('/my-work')
  showTool()
}
</script>

<template>
  <!-- Desktop Navigation -->
  <nav
    :class="[
      'border-brdr/20 bg-primary/80 fixed top-5 left-1/2 z-[99] hidden w-lg -translate-x-1/2 items-center justify-between rounded-xl border p-2 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out sm:flex',
      isVisible ? 'translate-y-0 opacity-95' : '-translate-y-20 opacity-0',
    ]"
  >
    <div class="flex gap-8">
      <RouterLink to="/" class="group relative">
        <button
          class="group group-hover:text-acc text-fg hover:bg-sec/60 dark:hover:bg-sec cursor-pointer rounded-lg transition-colors duration-200"
        >
          <!-- Active Indicator -->
          <div
            class="relative flex flex-col items-center rounded-md px-2 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="$route.path === '/'"
              class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <HomeIcon class="size-5" />
            <p>Home</p>
          </div>
        </button>
      </RouterLink>
      <RouterLink to="/repairs" class="group relative">
        <button
          class="group group-hover:text-acc text-fg hover:bg-sec/60 dark:hover:bg-sec transi6 tion-colors cursor-pointer rounded-lg duration-200"
        >
          <!-- Active Indicator -->
          <div
            class="relative flex flex-col items-center rounded-md px-2 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="$route.path === '/repairs'"
              class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <ChatBubbleBottomCenterTextIcon class="size-5" />
            Contact
          </div>
        </button>
      </RouterLink>
      <RouterLink to="/my-work" class="group relative">
        <button
          class="group group-hover:text-acc text-fg hover:bg-sec/60 dark:hover:bg-sec cursor-pointer rounded-lg transition-colors duration-200"
        >
          <!-- Active Indicator -->
          <div
            class="relative flex flex-col items-center rounded-md px-2 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="$route.path === '/my-work'"
              class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <PhotoIcon class="size-5" />
            My Work
          </div>
        </button>
      </RouterLink>
    </div>
    <!-- Main nav & Dark mode border (pl-5 to control) -->
    <div class="border-brdr dark:border-brdr group relative ml-4 border-l pl-5">
      <div v-if="isAuthenticated" class="flex items-center gap-4">
        <div>
          <div
            class="hover:bg-acc cursor-pointer overflow-hidden rounded-full"
            :class="[toolVisible ? 'bg-acc' : '']"
            @click="showTool()"
          >
            <img :src="avatarUrl" alt="avatar" class="max-h-9 w-full object-cover" />
          </div>
          <div ref="tooltip-ref">
            <Transition>
              <ToolTip wrapper-class="absolute right-3 top-12" v-if="toolVisible">
                <div class="text-fg font-sec flex flex-col items-start gap-2">
                  <button
                    class="hover:text-acc cursor-pointer truncate transition duration-200"
                    @click="toolNewPostNav()"
                  >
                    New post
                  </button>
                  <button class="hover:text-danger cursor-pointer transition duration-200">
                    Sign out
                  </button>
                </div>
              </ToolTip>
            </Transition>
          </div>
        </div>
        <div class="relative">
          <DarkMode size="8" class="hover:text-acc transition duration-200" />
        </div>
      </div>
      <div v-else class="flex gap-4">
        <DarkMode size="8" class="hover:text-acc mr-4 transition duration-200" />
      </div>
    </div>
  </nav>

  <!-- MOBILE NAVIGATION HERE -->
  <nav class="fixed right-0 bottom-0 left-0 z-[99] sm:hidden">
    <!-- Glassmorphism backdrop -->
    <div class="bg-primary/90 border-brdr/30 absolute inset-0 border-t backdrop-blur-lg"></div>

    <!-- Navigation content -->
    <div class="relative flex items-center justify-around px-2 py-3">
      <RouterLink
        to="/"
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200"
        :class="$route.path === '/' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <HomeIcon class="size-6 transition-transform duration-200" />
          <!-- Active indicator -->
          <div
            v-if="$route.path === '/'"
            class="bg-acc absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full"
          ></div>
        </div>
        <span class="font-medium tracking-wide">Home</span>
      </RouterLink>

      <RouterLink
        to="/repairs"
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200"
        :class="$route.path === '/repairs' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <WrenchIcon class="size-6 transition-transform duration-200" />
          <!-- Active indicator -->
          <div
            v-if="$route.path === '/repairs'"
            class="bg-acc absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full"
          ></div>
        </div>
        <span class="font-medium tracking-wide">Repairs</span>
      </RouterLink>

      <RouterLink
        to="/my-work"
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200"
        :class="$route.path === '/my-work' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <PhotoIcon class="size-6 transition-transform duration-200" />
          <!-- Active indicator -->
          <div
            v-if="$route.path === '/my-work'"
            class="bg-acc absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full"
          ></div>
        </div>
        <span class="font-medium tracking-wide">My Work</span>
      </RouterLink>

      <div
        class="group text-fg hover:text-acc flex flex-col items-center gap-1.5 text-xs transition-all duration-200"
      >
        <div class="transition-transform duration-200">
          <DarkMode />
        </div>
        <span class="font-medium tracking-wide">Theme</span>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
