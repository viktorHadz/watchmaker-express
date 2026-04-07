<script setup>
import { ref, onMounted, onUnmounted, computed, useTemplateRef, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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

const DEFAULT_AVATAR_PATH = '/pictures/avatars/vik_avatar_sm.png'

const router = useRouter()
const route = useRoute()
const { user, isAuthenticated, signOut } = useAuth()

const isVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 10
const avatarLoadFailed = ref(false)

const handleScroll = () => {
  const currentScrollY = window.scrollY

  if (currentScrollY <= 50) {
    isVisible.value = true
    lastScrollY.value = currentScrollY
    return
  }

  if (Math.abs(currentScrollY - lastScrollY.value) < scrollThreshold) return

  isVisible.value = currentScrollY < lastScrollY.value
  lastScrollY.value = currentScrollY
}

const avatarUrl = computed(() => {
  if (avatarLoadFailed.value) {
    return DEFAULT_AVATAR_PATH
  }

  if (user.value?.provider === 'google') {
    return '/api/auth/avatar'
  }

  return user.value?.avatar || DEFAULT_AVATAR_PATH
})

const handleAvatarError = () => {
  avatarLoadFailed.value = true
}

const DropdownRef = useTemplateRef('tooltip-ref')
const tooltipButtonRef = useTemplateRef('tooltip-button-ref')
const showDropdown = ref(false)

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}

function toolNewPostNav() {
  router.push('/admin/editor')
  isOpenMobile.value = false
  showDropdown.value = false
}

const isOpenMobile = ref(false)
const isOpenRef = useTemplateRef('mobile-dropdown-ref')
const mobileButtonRef = useTemplateRef('mobile-dropdown-button-ref')

function toggleMenu() {
  isOpenMobile.value = !isOpenMobile.value
}

onClickOutside(DropdownRef, (event) => {
  if (tooltipButtonRef.value?.contains(event.target)) return
  showDropdown.value = false
})

onClickOutside(isOpenRef, (event) => {
  if (mobileButtonRef.value?.contains(event.target)) return
  isOpenMobile.value = false
})

onMounted(() => {
  lastScrollY.value = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
})

watch(
  () => user.value?.avatar,
  () => {
    avatarLoadFailed.value = false
  },
)

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <!-- Desktop Navigation -->
  <nav
    :class="[
      'border-brdr/20 bg-primary/80 fixed top-5 left-1/2 z-[99] hidden w-[min(92vw,64rem)] -translate-x-1/2 items-center justify-between rounded-xl border px-3 py-2 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out sm:flex',
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0',
    ]"
  >
    <div class="flex items-center gap-2 sm:gap-4">
      <RouterLink to="/" class="group">
        <button
          class="text-fg hover:bg-sec/60 hover:text-acc cursor-pointer rounded-lg transition-colors duration-200"
        >
          <div
            class="relative flex flex-col items-center rounded-md px-3 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="route.path === '/'"
              class="bg-acc absolute top-0 right-0 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <HomeIcon class="size-6 stroke-1" />
            <p>Home</p>
          </div>
        </button>
      </RouterLink>

      <RouterLink to="/repairs" class="group">
        <button
          class="text-fg hover:bg-sec/60 hover:text-acc cursor-pointer rounded-lg transition-colors duration-200"
        >
          <div
            class="relative flex flex-col items-center rounded-md px-3 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="route.path === '/repairs'"
              class="bg-acc absolute top-0 right-0 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <WrenchScrewdriverIcon class="size-6 stroke-1" />
            <p>Repairs</p>
          </div>
        </button>
      </RouterLink>

      <RouterLink to="/my-work" class="group">
        <button
          class="text-fg hover:bg-sec/60 hover:text-acc cursor-pointer rounded-lg transition-colors duration-200"
        >
          <div
            class="relative flex flex-col items-center rounded-md px-3 py-1 text-xs whitespace-nowrap"
          >
            <div
              v-if="route.path.startsWith('/my-work')"
              class="bg-acc absolute top-0 right-0 h-2 w-2 animate-pulse rounded-full"
            ></div>
            <IconGallery class="size-6 stroke-1" />
            <p>My Work</p>
          </div>
        </button>
      </RouterLink>
    </div>

    <div class="border-brdr ml-4 flex items-center border-l pl-4">
      <div v-if="isAuthenticated" class="flex items-center gap-4">
        <div class="relative">
          <button
            ref="tooltip-button-ref"
            class="hover:bg-acc h-9 w-9 cursor-pointer overflow-hidden rounded-lg transition-colors duration-200"
            :class="showDropdown ? 'bg-acc' : ''"
            @click="toggleDropdown"
          >
            <img
              :src="avatarUrl"
              alt="avatar"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="handleAvatarError"
            />
          </button>

          <div ref="tooltip-ref">
            <Transition>
              <NavDropdown
                v-if="showDropdown"
                wrapper-class="absolute top-[calc(100%+0.75rem)] right-0"
                triangle-class="left-auto right-3 translate-x-0"
                triangle-border-class="left-auto right-[9px] translate-x-0"
              >
                <div
                  class="text-fg font-sec flex min-w-44 flex-col items-start gap-3 p-2 font-medium"
                >
                  <button
                    class="hover:text-acc flex w-full cursor-pointer items-center gap-3 truncate rounded-lg p-1 transition duration-200"
                    @click="toolNewPostNav"
                  >
                    <div
                      class="bg-acc/15 flex size-8 flex-shrink-0 items-center justify-center rounded-md"
                    >
                      <PlusIcon class="text-acc size-4" />
                    </div>
                    New post
                  </button>

                  <button
                    class="hover:text-danger flex w-full cursor-pointer items-center gap-3 rounded-lg p-1 transition duration-200"
                    @click="signOut()"
                  >
                    <div
                      class="bg-danger/15 flex size-8 flex-shrink-0 items-center justify-center rounded-md"
                    >
                      <ArrowRightStartOnRectangleIcon class="text-danger size-4" />
                    </div>
                    Sign out
                  </button>
                </div>
              </NavDropdown>
            </Transition>
          </div>
        </div>

        <DarkMode size="9" class="hover:text-acc transition duration-200" />
      </div>

      <div v-else>
        <DarkMode size="8" class="hover:text-acc transition duration-200" />
      </div>
    </div>
  </nav>

  <!-- Mobile Navigation -->
  <nav class="fixed right-0 bottom-0 left-0 z-[99] sm:hidden">
    <div v-if="isAuthenticated" class="fixed right-4 bottom-16">
      <div
        class="card flex flex-col items-stretch overflow-hidden rounded-t-lg rounded-b-none shadow-xl backdrop-blur-md transition-all duration-300 ease-out"
        :class="isOpenMobile ? 'w-44' : 'w-20'"
      >
        <button
          ref="mobile-dropdown-button-ref"
          class="group relative flex h-14 touch-manipulation flex-col items-center justify-center rounded-t-lg px-4 transition-colors duration-300 ease-out"
          :class="isOpenMobile ? 'bg-sec-light/30' : 'active:bg-sec-light/20'"
          @click="toggleMenu"
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

          <div
            class="bg-acc absolute bottom-0 left-1/2 h-0.5 transition-all duration-300 ease-out"
            :class="
              isOpenMobile ? 'w-12 -translate-x-1/2 opacity-60' : 'w-0 -translate-x-1/2 opacity-0'
            "
          ></div>
        </button>

        <div
          ref="mobile-dropdown-ref"
          class="overflow-hidden transition-all duration-300 ease-out"
          :class="isOpenMobile ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'"
        >
          <div class="border-brdr/40 bg-sec/10 border-t">
            <div class="space-y-1 p-3">
              <button
                class="font-sec active:bg-acc/10 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition duration-200 active:scale-95"
                @click="toolNewPostNav"
              >
                <div
                  class="bg-acc/15 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                >
                  <PlusIcon class="text-acc size-4" />
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
                  <ArrowRightStartOnRectangleIcon class="text-danger size-4" />
                </div>
                <span class="text-fg line-clamp-1">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-primary/90 border-brdr/30 absolute inset-0 border-t backdrop-blur-md"></div>

    <div class="relative flex items-center justify-around px-2 py-2">
      <RouterLink
        to="/"
        class="flex flex-col items-center gap-2 text-xs transition-all active:scale-95"
        :class="route.path === '/' ? 'text-acc' : 'text-fg'"
      >
        <HomeIcon class="size-6 stroke-1" />
        <span class="font-sec tracking-wide">Home</span>
      </RouterLink>

      <RouterLink
        to="/repairs"
        class="flex flex-col items-center gap-2 text-xs transition-all duration-200 ease-out active:scale-95"
        :class="route.path === '/repairs' ? 'text-acc' : 'text-fg'"
      >
        <WrenchScrewdriverIcon class="size-6 stroke-1" />
        <span class="font-sec font-medium tracking-wide">Repairs</span>
      </RouterLink>

      <RouterLink
        to="/my-work"
        class="flex flex-col items-center gap-2 text-xs transition-all duration-200 ease-out active:scale-95"
        :class="route.path.startsWith('/my-work') ? 'text-acc' : 'text-fg'"
      >
        <IconGallery class="size-6" />
        <span class="font-sec font-medium tracking-wide">My Work</span>
      </RouterLink>

      <div class="text-fg flex flex-col items-center gap-2 text-xs">
        <DarkMode />
        <span class="font-sec font-medium tracking-wide">Theme</span>
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
