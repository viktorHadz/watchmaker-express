<script setup>
import { ref } from 'vue'
import { CurrencyPoundIcon, ClockIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import Modal from '@/components/ModalBase.vue'
import PriceList from '@/components/PriceList.vue'

const showModal = ref(false)

const closeModal = () => {
  showModal.value = false
}
</script>

<template>
  <div
    class="bg-primary/80 dark:border-sec-mute/50 dark:bg-sec/80 sticky top-8 h-fit rounded-2xl border border-white/20 p-4 shadow-xl backdrop-blur-sm sm:p-8"
  >
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <div class="mb-4 flex items-center gap-3 sm:gap-4">
        <div class="flex-shrink-0">
          <div
            class="from-acc/20 to-acc/30 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br sm:size-16"
          >
            <ClockIcon class="text-acc size-6 sm:size-8"></ClockIcon>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-sec text-fg text-lg leading-tight font-semibold sm:text-2xl">
            Horological Excellence
          </h2>
        </div>
      </div>
      <p class="text-acc text-base leading-relaxed font-light sm:text-lg">
        If it's about watches, you're in the right place
      </p>
    </div>

    <!-- Services List -->
    <div class="space-y-4 sm:space-y-6">
      <div class="flex items-start space-x-3 sm:space-x-4">
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-full sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg mb-1 text-sm font-semibold sm:mb-2 sm:text-base">
            All Types of Repairs
          </h4>
          <p class="text-fg/80 text-xs leading-relaxed sm:text-sm">
            Vintage, modern, quartz, automatic... If it's built to be fixed, I'll gladly take a
            look. Leave me a message and we can decide what it needs.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3 sm:space-x-4">
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-full sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg mb-1 text-sm font-semibold sm:mb-2 sm:text-base">
            Fellow Watchmakers
          </h4>
          <p class="text-fg/80 text-xs leading-relaxed sm:text-sm">
            Stuck on something? I'm always up for problem-solving, sharing ideas, or trading notes
            on the bench with fellow craftspeople.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3 sm:space-x-4">
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-full sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg mb-1 text-sm font-semibold sm:mb-2 sm:text-base">Watch Enthusiasts</h4>
          <p class="text-fg/80 text-xs leading-relaxed sm:text-sm">
            Love watches and want to chat? That's welcome too. Always good to hear from fellow
            enthusiasts about timepieces and horology.
          </p>
        </div>
      </div>
    </div>

    <!-- Price List Button -->
    <div class="border-brdr/20 mt-6 border-t pt-4 sm:mt-8 sm:pt-6">
      <div
        class="group from-acc/10 to-acc/5 hover:from-acc/20 hover:to-acc/10 border-acc/20 hover:border-acc/30 flex cursor-pointer items-center justify-between rounded-xl border bg-gradient-to-r p-3 transition-all duration-300 sm:p-4"
        @click="showModal = true"
      >
        <div class="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
          <div
            class="bg-acc/20 group-hover:bg-acc/30 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10"
          >
            <CurrencyPoundIcon class="text-acc h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-sec text-fg text-sm font-semibold sm:text-base">Service Pricing</p>
            <p class="text-fg/60 text-xs sm:text-sm">View detailed price list</p>
          </div>
        </div>
        <ChevronRightIcon
          class="text-acc size-4 flex-shrink-0 transition-transform group-hover:translate-x-1 sm:size-5"
        ></ChevronRightIcon>
      </div>
    </div>

    <!-- Modal for Price List -->
    <Teleport to="body">
      <Modal :show="showModal" @close="closeModal">
        <template #header>
          <h2
            class="text-fg font-sec px-4 text-center text-lg font-semibold tracking-wider sm:text-xl lg:text-2xl"
          >
            Service Price List
          </h2>
        </template>
        <template #main>
          <PriceList />
        </template>
        <template #footer>
          <div class="px-4 text-center">
            <button @click="closeModal" class="btn">Close</button>
          </div>
        </template>
      </Modal>
    </Teleport>
  </div>
</template>
