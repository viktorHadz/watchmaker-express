<script setup>
import { ref, onMounted, onUnmounted, computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { onClickOutside } from '@vueuse/core'
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  ChevronUpIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import IconGallery from './icons/IconGallery.vue'
import DarkMode from './DarkMode.vue'

import NavDropdown from './DropDown.vue'

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
const { user, isAuthenticated, signOut } = useAuth()
const avatarUrl = computed(() => `${user.value?.avatar}` || '/default-avatar.png')

const DropdownRef = useTemplateRef('tooltip-ref')
const tooltipButtonRef = useTemplateRef('tooltip-button-ref')
const showDropdown = ref(false)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
function toolNewPostNav() {
  router.push('/my-work')
  toggleDropdown()
}

// Mobile nav slider
const isOpenMobile = ref(false)
const isOpenRef = useTemplateRef('mobile-dropdown-ref')
const mobileButtonRef = useTemplateRef('mobile-dropdown-button-ref')
const toggleMenu = () => {
  isOpenMobile.value = !isOpenMobile.value
}

onClickOutside(DropdownRef, (event) => {
  if (tooltipButtonRef.value && tooltipButtonRef.value.contains(event.target)) {
    return
  }
  showDropdown.value = false
})
// Mobile click outside
onClickOutside(isOpenRef, () => {
  if (mobileButtonRef.value && mobileButtonRef.value.contains(event.target)) {
    return
  }
  isOpenMobile.value = false
})

onMounted(() => {
  // Finds the actual scrolling container (the div with overflow-y-auto)
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
            <HomeIcon class="size-6 stroke-1" />
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
            <WrenchScrewdriverIcon class="size-6 stroke-1" />
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
            <IconGallery class="size-6 stroke-1"></IconGallery>
            My Work
          </div>
        </button>
      </RouterLink>
    </div>
    <!-- Main nav & Dark mode border (pl-5 to control) -->
    <div class="border-brdr dark:border-brdr group relative ml-4 border-l pl-5">
      <div v-if="isAuthenticated" class="flex items-center gap-8">
        <div>
          <div
            ref="tooltip-button-ref"
            class="hover:bg-acc overflow-hidden rounded-full"
            :class="[showDropdown ? 'bg-acc' : 'cursor-pointer']"
            @click="toggleDropdown()"
          >
            <img :src="avatarUrl" alt="avatar" class="max-h-9 w-full object-cover" />
          </div>
          <div ref="tooltip-ref">
            <Transition>
              <NavDropdown wrapper-class="absolute right-3 top-12" v-if="showDropdown">
                <div class="text-fg font-sec flex flex-col items-start gap-4 p-2 font-medium">
                  <button
                    class="hover:text-acc flex cursor-pointer items-center gap-3 truncate transition duration-200"
                    @click="toolNewPostNav()"
                  >
                    <div
                      class="bg-acc/15 flex size-8 flex-shrink-0 items-center justify-center rounded-md"
                    >
                      <PlusIcon class="text-acc size-4"></PlusIcon>
                    </div>
                    New post
                  </button>
                  <button
                    class="hover:text-danger flex cursor-pointer items-center gap-3 transition duration-200"
                    @click="signOut()"
                  >
                    <div
                      class="bg-danger/15 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                    >
                      <ArrowRightStartOnRectangleIcon
                        class="text-danger size-4"
                      ></ArrowRightStartOnRectangleIcon>
                    </div>
                    Sign out
                  </button>
                </div>
              </NavDropdown>
            </Transition>
          </div>
        </div>
        <div class="relative pr-2">
          <DarkMode size="9" class="hover:text-acc transition duration-200" />
        </div>
      </div>
      <div v-else class="flex gap-4">
        <DarkMode size="8" class="hover:text-acc mr-4 transition duration-200" />
      </div>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="fixed right-0 bottom-0 left-0 z-[99] sm:hidden">
    <div v-if="isAuthenticated" class="fixed right-4 bottom-16 will-change-transform">
      <div
        class="card flex transform-gpu flex-col items-stretch overflow-hidden rounded-t-xl rounded-b-none shadow-xl backdrop-blur-md transition-all duration-400 ease-out"
        :class="isOpenMobile ? 'w-44' : 'w-20'"
      >
        <!-- Admin Button - Optimized for touch -->
        <button
          ref="mobile-dropdown-button-ref"
          @click="toggleMenu()"
          class="group relative flex h-14 max-h-10 touch-manipulation flex-col items-center justify-center rounded-t-xl px-4 transition-colors duration-300 ease-out"
          :class="isOpenMobile ? 'bg-sec-light/30' : 'active:bg-sec-light/20'"
        >
          <ChevronUpIcon
            class="size-5 transition-transform duration-300 ease-out"
            :class="isOpenMobile ? 'text-acc rotate-180' : 'text-fg-mute'"
          />
          <div
            class="font-sec text-xs font-medium tracking-wide transition-colors duration-150"
            :class="isOpenMobile ? 'text-acc' : 'text-fg'"
          >
            admin
          </div>
          <!-- Active indicator -->
          <div
            class="bg-acc absolute bottom-0 left-1/2 h-0.5 transition-all duration-400 ease-out"
            :class="
              isOpenMobile ? 'w-12 -translate-x-1/2 opacity-60' : 'w-0 -translate-x-1/2 opacity-0'
            "
          ></div>
        </button>
        <!-- Background active admin btn -->
        <div
          class="bg-acc/15 dark:bg-acc/5 pointer-events-none absolute -inset-px -z-10 h-10.5 rounded-t-xl transition-opacity duration-200 ease-out"
          :class="isOpenMobile ? 'opacity-100' : 'opacity-0'"
        ></div>

        <div
          class="overflow-hidden transition-all duration-400 ease-out"
          :class="isOpenMobile ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'"
          ref="mobile-dropdown-ref"
        >
          <div class="border-brdr/40 bg-sec/10 border-t">
            <div class="space-y-1 p-3">
              <button
                class="font-sec active:bg-acc/10 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition duration-200 active:scale-95"
              >
                <div
                  class="bg-acc/15 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                >
                  <PlusIcon class="text-acc size-4"></PlusIcon>
                </div>
                <span class="text-fg line-clamp-1">New post</span>
              </button>

              <button
                class="font-sec active:bg-danger/10 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition duration-200 active:scale-95"
                @click="signOut()"
              >
                <div
                  class="bg-danger/15 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                >
                  <ArrowRightStartOnRectangleIcon
                    class="text-danger size-4"
                  ></ArrowRightStartOnRectangleIcon>
                </div>
                <span class="text-fg line-clamp-1">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-primary dark:bg-sec/95 border-brdr/30 absolute inset-0 border-t backdrop-blur-md"
    ></div>

    <div class="relative flex items-center justify-around px-2 py-2">
      <RouterLink
        to="/"
        class="flex flex-col items-center gap-2 text-xs transition-all active:scale-95"
        :class="$route.path === '/' ? 'text-acc' : 'text-fg'"
      >
        <HomeIcon class="size-6 stroke-1" />
        <span class="font-sec tracking-wide">Home</span>
      </RouterLink>

      <RouterLink
        to="/repairs"
        class="flex flex-col items-center gap-2 text-xs transition-all duration-200 ease-out active:scale-95"
        :class="$route.path === '/repairs' ? 'text-acc' : 'text-fg'"
      >
        <WrenchScrewdriverIcon class="size-6 stroke-1" />
        <span class="font-sec font-medium tracking-wide">Repairs</span>
      </RouterLink>

      <RouterLink
        to="/my-work"
        class="flex flex-col items-center gap-2 text-xs transition-all duration-200 ease-out active:scale-95"
        :class="$route.path === '/my-work' ? 'text-acc' : 'text-fg'"
      >
        <IconGallery class="size-6"></IconGallery>
        <span class="font-sec font-medium tracking-wide">My Work</span>
      </RouterLink>

      <button
        class="text-fg flex flex-col items-center gap-2 text-xs transition-all duration-200 ease-out active:scale-95"
      >
        <DarkMode />
        <span class="font-sec font-medium tracking-wide">Theme</span>
      </button>
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
h-auto {
  height: auto;
}
</style>
