import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref('success')
  const visible = ref(false)

  function showToast(newMessage, newType = 'success') {
    message.value = newMessage
    type.value = newType
    visible.value = true

    setTimeout(() => {
      visible.value = false
    }, 5000)
  }

  return {
    message,
    type,
    visible,
    showToast,
  }
})
