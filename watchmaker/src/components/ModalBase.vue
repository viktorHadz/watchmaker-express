<script setup>
import { useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
defineProps({
  show: Boolean,
})
const emit = defineEmits(['close'])
const modalRef = useTemplateRef('pricing-modal')
onClickOutside(modalRef, () => {
  emit('close')
})
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed top-0 left-0 z-[100] flex h-full w-full items-center justify-center bg-black/50 transition-all duration-initial sm:items-center"
    >
      <div
        class="bg-primary max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl shadow-xl sm:max-w-lg sm:rounded-xl"
      >
        <div class="p-4 sm:p-6" ref="pricing-modal">
          <header v-if="$slots.header">
            <slot name="header" />
          </header>

          <main>
            <slot name="main" />
          </main>

          <footer
            v-if="$slots.footer"
            class="bg-primary border-fg/10 sticky bottom-0 mt-6 border-t py-3"
          >
            <slot name="footer">
              <button class="modal-default-button" @click="emit('close')">OK</button>
            </slot>
          </footer>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
