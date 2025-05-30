<script setup>
import { RouterView } from 'vue-router'
// import NavigationBar from './components/NavigationBar.vue'
import ToastElement from './components/ToastElement.vue'
import { useToastStore } from '@/stores/toast'
import NavHorizontal from './components/NavHorizontal.vue'
const toast = useToastStore()
</script>

<template>
  <main class="text-fg relative flex h-screen overflow-hidden">
    <!-- Global Background Pattern -->
    <div class="absolute inset-0 z-0">
      <!-- Base theme-aware background -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      ></div>

      <!-- Your diagonal stripe pattern -->
      <div
        class="absolute inset-0 opacity-20"
        style="
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgb(245 158 11 / 0.1) 20px,
            rgb(245 158 11 / 0.1) 40px
          );
        "
      ></div>
    </div>

    <NavHorizontal></NavHorizontal>
    <!-- <NavigationBar /> -->

    <div class="relative z-10 flex flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto">
        <!-- Add top padding on desktop to account for fixed nav -->
        <div class="pt-20 pb-20 sm:pt-20 sm:pb-4">
          <RouterView />
        </div>
      </div>
    </div>

    <Transition name="toast">
      <ToastElement
        v-if="toast.visible"
        :message="toast.message"
        :type="toast.type"
        class="fixed right-4 z-50"
        :class="{ 'bottom-24 sm:bottom-4': true }"
      />
    </Transition>
  </main>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}
</style>
