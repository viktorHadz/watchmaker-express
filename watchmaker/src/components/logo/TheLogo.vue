<script setup>
import { useLocalStorage } from '@vueuse/core'
const mode = useLocalStorage('vueuse-color-scheme')
</script>
<template>
  <div>
    <div class="relative h-64 w-64">
      <!-- Central Piece -->
      <img
        v-if="mode === 'dark'"
        src="./dark-mode-central.png"
        alt="central-watch-mechanism"
        loading="eager"
        decoding="async"
        class="absolute size-64"
      />
      <img
        v-if="mode === 'light'"
        src="./light-mode-central.png"
        alt="central-watch-mechanism"
        loading="eager"
        decoding="async"
        class="absolute size-64"
      />
      <!-- top-piece -->
      <img
        src="./top-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="top-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-4.5 left-25 size-14"
      />
      <img
        src="./central-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="middle-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-11 left-33 size-26"
      />
      <img
        src="./bottom-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="bottom-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-35 left-48 size-9"
      />
    </div>
  </div>
</template>
