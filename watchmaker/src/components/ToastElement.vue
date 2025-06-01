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
    class="fixed right-12 bottom-5 z-[101] rounded px-4 py-2 text-2xl font-bold text-white shadow-md"
    :class="{
      'bg-green-600': type === 'success',
      'bg-red-500': type === 'error',
      'bg-amber-500': type === 'warning',
    }"
  >
    {{ message }}
  </div>
</template>
