<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  HomeIcon,
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  WrenchIcon,
} from '@heroicons/vue/24/outline'
import DarkMode from './DarkMode.vue'

const isVisible = ref(true)
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
</script>

<template>
  <!-- Desktop Navigation -->
  <nav
    :class="[
      'border-brdr/20 bg-primary/80 fixed top-5 left-1/2 z-[500] hidden w-lg -translate-x-1/2 items-center justify-between rounded-xl border p-3 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out sm:flex',
      isVisible ? 'translate-y-0 opacity-95' : '-translate-y-20 opacity-0',
    ]"
  >
    <div class="flex gap-8">
      <RouterLink to="/" class="group relative">
        <button
          class="group hover:bg-sec/10 dark:hover:bg-sec/50 cursor-pointer rounded-lg p-2 transition-colors duration-200"
        >
          <!-- Active Indicator -->
          <div
            v-if="$route.path === '/'"
            class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
          ></div>
          <HomeIcon class="text-fg group-hover:text-acc size-5 transition-colors duration-200" />
        </button>
        <!-- Tooltip -->
        <div
          class="pointer-events-none absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <div class="bg-sec text-fg2 rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            Home
            <div class="bg-sec absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/repairs" class="group relative">
        <button
          class="group hover:bg-sec/10 dark:hover:bg-sec/50 cursor-pointer rounded-lg p-2 transition-colors duration-200"
        >
          <!-- Active Indicator -->
          <div
            v-if="$route.path === '/repairs'"
            class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
          ></div>
          <ChatBubbleBottomCenterTextIcon
            class="text-fg group-hover:text-acc size-5 transition-colors duration-200"
          />
        </button>
        <!-- Tooltip -->
        <div
          class="pointer-events-none absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <div class="bg-sec text-fg2 rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            Repairs
            <div class="bg-sec absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
          </div>
        </div>
      </RouterLink>

      <RouterLink to="/my-work" class="group relative">
        <button
          class="group hover:bg-sec/10 dark:hover:bg-sec/50 cursor-pointer rounded-lg p-2 transition-colors duration-200"
        >
          <!-- Active Indicator -->
          <div
            v-if="$route.path === '/my-work'"
            class="bg-acc absolute top-0 -right-0.5 h-2 w-2 animate-pulse rounded-full"
          ></div>
          <PhotoIcon class="text-fg group-hover:text-acc size-5 transition-colors duration-200" />
        </button>
        <!-- Tooltip -->
        <div
          class="pointer-events-none absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <div class="bg-sec text-fg2 rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
            My Work
            <div class="bg-sec absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
          </div>
        </div>
      </RouterLink>
    </div>

    <div class="border-brdr/20 dark:border-fg/20 group relative ml-4 border-l pl-4">
      <DarkMode class="hover:text-acc transition duration-200" />
      <!-- Tooltip for Dark Mode -->
      <div
        class="pointer-events-none absolute -bottom-10 left-1/2 z-10 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <div class="bg-sec text-fg2 rounded-md px-2 py-1 text-xs whitespace-nowrap shadow-lg">
          Toggle Theme
          <div class="bg-sec absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"></div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="fixed right-0 bottom-0 left-0 z-[699] sm:hidden">
    <!-- Glassmorphism backdrop -->
    <div class="bg-primary/90 border-brdr/30 absolute inset-0 border-t backdrop-blur-lg"></div>

    <!-- Navigation content -->
    <div class="relative flex items-center justify-around px-2 py-3">
      <RouterLink
        to="/"
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200 hover:scale-105"
        :class="$route.path === '/' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <HomeIcon class="size-6 transition-transform duration-200 group-hover:scale-110" />
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
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200 hover:scale-105"
        :class="$route.path === '/repairs' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <WrenchIcon class="size-6 transition-transform duration-200 group-hover:scale-110" />
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
        class="group flex flex-col items-center gap-1.5 text-xs transition-all duration-200 hover:scale-105"
        :class="$route.path === '/my-work' ? 'text-acc' : 'text-fg hover:text-acc'"
      >
        <div class="relative">
          <PhotoIcon class="size-6 transition-transform duration-200 group-hover:scale-110" />
          <!-- Active indicator -->
          <div
            v-if="$route.path === '/my-work'"
            class="bg-acc absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full"
          ></div>
        </div>
        <span class="font-medium tracking-wide">My Work</span>
      </RouterLink>

      <div
        class="group text-fg hover:text-acc flex flex-col items-center gap-1.5 text-xs transition-all duration-200 hover:scale-105"
      >
        <div class="transition-transform duration-200 group-hover:scale-110">
          <DarkMode />
        </div>
        <span class="font-medium tracking-wide">Theme</span>
      </div>
    </div>
  </nav>
</template>
