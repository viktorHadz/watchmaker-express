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
    class="fixed top-0 z-[200] w-full px-4 py-2 text-2xl font-medium text-white shadow-md lg:top-auto lg:right-12 lg:bottom-5 lg:w-auto lg:rounded"
    :class="{
      'bg-success/90 border border-green-500': type === 'success',
      'bg-danger/80 border border-red-500': type === 'error',
      'bg-warn/90 border border-orange-500': type === 'warning',
      'border border-blue-200 bg-blue-500': type === 'info',
    }"
  >
    {{ message }}
  </div>
</template>
