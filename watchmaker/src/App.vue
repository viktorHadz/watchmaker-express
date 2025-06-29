<script setup>
import { RouterView } from 'vue-router'
import ToastElement from './components/ToastElement.vue'
import { useToastStore } from '@/stores/toast'
import NavHorizontal from './components/NavHorizontal.vue'
import SiteFooter from './components/SiteFooter.vue'
const toast = useToastStore()
</script>

<template>
  <main class="text-fg relative flex h-screen overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <!-- Base gradient background -->
      <div class="from-primary via-sec-light to-sec absolute inset-0 bg-gradient-to-br"></div>

      <!-- Subtle metal texture overlay -->
      <div
        class="absolute inset-0 opacity-30"
        style="
          background-image:
            radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.02) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
          background-size: 24px 24px;
          background-position:
            0 0,
            12px 12px;
        "
      ></div>

      <!-- watch dial like texture -->
      <div
        class="absolute inset-0 opacity-10"
        style="
          background-image:
            linear-gradient(
              45deg,
              transparent 49%,
              rgba(0, 0, 0, 0.03) 49%,
              rgba(0, 0, 0, 0.03) 51%,
              transparent 51%
            ),
            linear-gradient(
              -45deg,
              transparent 49%,
              rgba(0, 0, 0, 0.03) 49%,
              rgba(0, 0, 0, 0.03) 51%,
              transparent 51%
            );
          background-size: 20px 20px;
        "
      ></div>
    </div>

    <NavHorizontal />

    <div class="relative z-10 flex flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto" id="app-scroll-container">
        <div class="pt-8 pb-20 sm:pt-20 sm:pb-4">
          <RouterView v-slot="{ Component, route }">
            <Transition name="page" mode="out-in" appear>
              <component :is="Component" :key="route.path" />
            </Transition>
          </RouterView>
        </div>
        <SiteFooter />
      </div>
    </div>
    <Transition name="toast">
      <ToastElement v-if="toast.visible" :message="toast.message" :type="toast.type" />
    </Transition>
  </main>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Toast transitions */
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
