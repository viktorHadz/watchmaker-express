<script setup>
import { useLocalStorage } from '@vueuse/core'
const mode = useLocalStorage('vueuse-color-scheme')
</script>
<template>
  <div>
    <div class="relative size-52 sm:size-64">
      <!-- Central Piece -->
      <img
        v-if="mode === 'dark'"
        src="./dark-mode-central.png"
        alt="central-watch-mechanism"
        loading="eager"
        decoding="async"
        class="absolute size-52 sm:size-64"
      />
      <img
        v-if="mode === 'light'"
        src="./light-mode-central.png"
        alt="central-watch-mechanism"
        loading="eager"
        decoding="async"
        class="absolute size-52 sm:size-64"
      />
      <!-- top-piece -->
      <img
        src="./top-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="top-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-3.5 left-20 size-12 sm:top-4.5 sm:left-25 sm:size-14"
      />
      <img
        src="./central-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="middle-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-9 left-27 size-21 sm:top-11 sm:left-33 sm:size-26"
      />
      <img
        src="./bottom-wheel_1.png"
        alt="top-wheel-of-mechanism"
        id="bottom-wheel"
        loading="eager"
        decoding="async"
        class="absolute top-28 left-39 size-8 sm:top-35 sm:left-48 sm:size-9"
      />
    </div>
  </div>
</template>
