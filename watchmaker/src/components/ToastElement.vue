<script setup>
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
  },
})
</script>

<template>
  <div
    v-if="toast.visible"
    class="fixed top-5 right-12 z-[101] rounded px-4 py-2 text-2xl font-medium text-white shadow-md sm:top-auto sm:bottom-5"
    :class="{
      'bg-success/90 border border-green-500': type === 'success',
      'bg-danger/80 border border-red-500': type === 'error',
      'bg-warn/90 border border-orange-500': type === 'warning',
    }"
  >
    {{ message }}
  </div>
</template>
