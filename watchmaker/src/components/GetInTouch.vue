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
    class="bg-primary/80 dark:border-sec-mute/50 dark:bg-sec/80 sticky top-8 h-fit rounded-2xl border border-white/20 p-8 shadow-xl backdrop-blur-sm"
  >
    <!-- Header -->
    <div class="mb-8">
      <div class="mb-4 flex items-center gap-4">
        <div>
          <div
            class="from-acc/20 to-acc/30 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br"
          >
            <ClockIcon class="text-acc size-8"></ClockIcon>
          </div>
        </div>
        <h2 class="font-sec text-fg text-2xl font-semibold">Horological Excellence</h2>
      </div>
      <p class="text-acc text-lg font-light">If it's about watches, you're in the right place</p>
    </div>

    <!-- Services List -->
    <div class="space-y-6">
      <div class="flex items-start space-x-4">
        <div class="bg-acc mt-3 h-2 w-2 flex-shrink-0 rounded-full"></div>
        <div>
          <h4 class="text-fg mb-2 font-semibold">All Types of Repairs</h4>
          <p class="text-fg/80 text-sm leading-relaxed">
            Vintage, modern, quartz, automatic... If it's built to be fixed, I'll gladly take a
            look. Leave me a message and we can decide what it needs.
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
        <ChevronRightIcon
          class="text-acc size-5 transition-transform group-hover:translate-x-1"
        ></ChevronRightIcon>
      </div>
    </div>
    <!-- Modal for Price List -->
    <Teleport to="body">
      <Modal :show="showModal" @close="closeModal">
        <template #header>
          <h2 class="text-fg font-sec text-center text-xl font-semibold tracking-wider sm:text-2xl">
            Service Price List
          </h2>
        </template>
        <template #main>
          <PriceList />
        </template>
        <template #footer>
          <div class="text-center">
            <button @click="closeModal" class="btn">Close</button>
          </div>
        </template>
      </Modal>
    </Teleport>
  </div>
</template>
