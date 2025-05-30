<script setup>
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode({
  attribute: 'data-theme',
  modes: {
    light: 'light',
    dark: 'dark',
  },
  disableTransition: false,
})

const toggleMode = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button @click="toggleMode" class="theme-toggle-btn cursor-pointer">
    <transition name="rotate-element" mode="out-in">
      <div :key="mode" class="icon-wrapper">
        <component :is="mode === 'dark' ? SunIcon : MoonIcon" class="size-6 stroke-1" />
      </div>
    </transition>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotate-element-enter-active,
.rotate-element-leave-active {
  transition:
    transform 0.5s ease,
    opacity 0.5s ease;
  transform-origin: center center;
}

.rotate-element-enter-from {
  opacity: 0.1;
  transform: rotate(-90deg);
}

.rotate-element-enter-to {
  opacity: 1;
  transform: rotate(0deg);
}

.rotate-element-leave-from {
  opacity: 1;
  transform: rotate(0deg);
}

.rotate-element-leave-to {
  opacity: 0;
  transform: rotate(180deg);
}
</style>
