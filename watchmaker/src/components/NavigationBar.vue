<!-- NavigationBar.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import { watch, ref } from 'vue'
import DarkMode from '@/components/DarkMode.vue'
import { useStorage } from '@vueuse/core'
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  WrenchIcon,
  PhotoIcon,
} from '@heroicons/vue/24/outline'

const expanded = useStorage('navigation-expanded', true)
const animationClass = ref('collapse')

watch(
  expanded,
  (newVal) => {
    animationClass.value = newVal ? 'expand' : 'collapse'
  },
  { immediate: true },
)
</script>

<template>
  <!-- Desktop sidebar -->
  <header
    class="from-sec to-sec-mute dark:text-fg text-fg2 font-sec border-brdr hover:bg-dark hidden h-screen flex-shrink-0 flex-col justify-between overflow-hidden border-r bg-gradient-to-b text-lg font-medium transition-all duration-300 ease-out sm:flex"
    :class="expanded ? 'w-40' : 'w-16'"
  >
    <div class="pt-6">
      <Transition name="nav-content" mode="out-in">
        <nav v-if="expanded" key="expanded" class="flex flex-col items-center gap-y-6 px-4">
          <RouterLink
            to="/"
            class="hover:text-acc router-link-active:text-acc transition-colors duration-200"
          >
            Home
          </RouterLink>
          <RouterLink
            to="/repairs"
            class="hover:text-acc router-link-active:text-acc transition-colors duration-200"
          >
            Repairs
          </RouterLink>
          <RouterLink
            to="/my-work"
            class="hover:text-acc router-link-active:text-acc whitespace-nowrap transition-colors duration-200"
          >
            My Work
          </RouterLink>
        </nav>
        <nav v-else key="collapsed" class="flex flex-col items-center gap-y-6 px-2">
          <RouterLink
            to="/"
            class="hover:text-acc router-link-active:text-acc p-2 transition-colors duration-200"
          >
            <HomeIcon class="size-6" />
          </RouterLink>
          <RouterLink
            to="/repairs"
            class="hover:text-acc router-link-active:text-acc p-2 transition-colors duration-200"
          >
            <WrenchIcon class="size-6" />
          </RouterLink>
          <RouterLink
            to="/my-work"
            class="hover:text-acc router-link-active:text-acc p-2 transition-colors duration-200"
          >
            <PhotoIcon class="size-6" />
          </RouterLink>
        </nav>
      </Transition>
    </div>

    <div class="flex flex-col items-center gap-8 pb-6">
      <button
        @click="expanded = !expanded"
        class="hover:text-acc p-2 transition-colors duration-200"
      >
        <Transition :name="animationClass" mode="out-in">
          <ChevronDoubleLeftIcon v-if="expanded" key="left" class="size-6" />
          <ChevronDoubleRightIcon v-else key="right" class="size-6" />
        </Transition>
      </button>
      <DarkMode class="hover:text-acc transition-colors duration-200" />
    </div>
  </header>

  <!-- Mobile bottom nav -->
  <nav
    class="dark:text-fg text-fg2 border-brdr from-sec to-sec-mute fixed right-0 bottom-0 left-0 z-[699] flex items-center justify-around border-t bg-gradient-to-l py-2 sm:hidden"
  >
    <RouterLink
      to="/"
      class="hover:text-acc router-link-active:text-acc flex flex-col items-center gap-2 text-xs"
    >
      <HomeIcon class="size-6" />
      <span>Home</span>
    </RouterLink>
    <RouterLink
      to="/repairs"
      class="hover:text-acc router-link-active:text-acc flex flex-col items-center gap-2 text-sm"
    >
      <WrenchIcon class="size-6" />
      <span>Repairs</span>
    </RouterLink>
    <RouterLink
      to="/my-work"
      class="hover:text-acc router-link-active:text-acc flex flex-col items-center gap-2 text-sm"
    >
      <PhotoIcon class="size-6" />
      <span>My Work</span>
    </RouterLink>
    <div class="hover:text-acc flex flex-col items-center gap-2 text-sm">
      <DarkMode class="size-5" />
      <span>Theme</span>
    </div>
  </nav>
</template>

<style scoped>
.nav-content-enter-active,
.nav-content-leave-active {
  transition: all 0.25s ease-out;
}

.nav-content-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.nav-content-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.expand-enter-active,
.collapse-enter-active {
  transition: all 0.3s ease-out;
}

.expand-enter-from,
.collapse-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.expand-leave-to,
.collapse-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.router-link-active {
  color: var(--color-acc);
}
</style>
