<script setup>
import { ref } from 'vue'
import { CurrencyPoundIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/ModalBase.vue'
import PriceList from '@/components/PriceList.vue'
const showModal = ref(false)
</script>

<template>
  <div
    class="bg-primary/80 dark:border-sec-mute/50 dark:bg-sec/80 sticky top-8 h-fit rounded-2xl border border-white/20 p-8 shadow-xl backdrop-blur-sm"
  >
    <!-- Header -->
    <div class="mb-8">
      <div
        class="from-acc/20 to-acc/30 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br"
      >
        <svg class="text-acc h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </div>
      <h2 class="font-sec text-fg mb-3 text-2xl font-semibold">Horological Excellence</h2>
      <p class="text-acc text-lg font-medium">If it's about watches, you're in the right place</p>
    </div>

    <!-- Services List -->
    <div class="space-y-6">
      <div class="flex items-start space-x-4">
        <div class="bg-acc mt-3 h-2 w-2 flex-shrink-0 rounded-full"></div>
        <div>
          <h4 class="text-fg mb-2 font-semibold">All Types of Repairs</h4>
          <p class="text-fg/80 text-sm leading-relaxed">
            Vintage, modern, quartz, automatic — if it's built to be fixed, I'll gladly take a look.
            Leave me a message and we can decide what it needs.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-4">
        <div class="bg-acc mt-3 h-2 w-2 flex-shrink-0 rounded-full"></div>
        <div>
          <h4 class="text-fg mb-2 font-semibold">Fellow Watchmakers</h4>
          <p class="text-fg/80 text-sm leading-relaxed">
            Stuck on something? I'm always up for problem-solving, sharing ideas, or trading notes
            on the bench with fellow craftspeople.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-4">
        <div class="bg-acc mt-3 h-2 w-2 flex-shrink-0 rounded-full"></div>
        <div>
          <h4 class="text-fg mb-2 font-semibold">Watch Enthusiasts</h4>
          <p class="text-fg/80 text-sm leading-relaxed">
            Love watches and want to chat? That's welcome too. Always good to hear from fellow
            enthusiasts about timepieces and horology.
          </p>
        </div>
      </div>
    </div>

    <!-- Price List Button -->
    <div class="border-brdr/20 mt-8 border-t pt-6">
      <div
        class="group from-acc/10 to-acc/5 hover:from-acc/20 hover:to-acc/10 border-acc/20 hover:border-acc/30 flex cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r p-4 transition-all duration-300"
        @click="showModal = true"
      >
        <div class="flex items-center space-x-3">
          <div
            class="bg-acc/20 group-hover:bg-acc/30 flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
          >
            <CurrencyPoundIcon class="text-acc h-5 w-5" />
          </div>
          <div>
            <p class="font-sec text-fg font-semibold">Service Pricing</p>
            <p class="text-fg/60 text-sm">View detailed price list</p>
          </div>
        </div>
        <svg
          class="text-acc h-5 w-5 transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </div>
    </div>
    <!-- Modal for Price List -->
    <Teleport to="body">
      <Modal :show="showModal">
        <template #header>
          <h2 class="text-fg font-sec text-center text-2xl font-medium tracking-wider">
            Service Price List
          </h2>
        </template>
        <template #main>
          <PriceList />
        </template>
        <template #footer>
          <div class="text-center">
            <button @click="showModal = false" class="btn">Close</button>
          </div>
        </template>
      </Modal>
    </Teleport>
  </div>
</template>
