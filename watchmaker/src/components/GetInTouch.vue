<script setup>
import { ClockIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div
    class="bg-primary/80 dark:border-sec-mute/50 dark:bg-sec/80 rounded-lg border border-white/20 p-4 shadow-xl backdrop-blur-sm sm:p-8"
  >
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <div class="mb-4 flex items-center gap-3 sm:gap-4">
        <div class="flex-shrink-0">
          <div
            class="from-acc/20 to-acc/30 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br sm:size-14"
          >
            <ClockIcon class="text-acc size-6 sm:size-8"></ClockIcon>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="font-sec text-fg/90 text-lg leading-tight font-medium sm:text-2xl">
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
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-lg sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg/80 dark:text-fg/90 mb-1 text-base font-semibold sm:mb-2">
            All Types of Repairs
          </h4>
          <p class="text-fg/90 text-sm leading-relaxed">
            Vintage, modern, quartz, automatic... If it's built to be fixed, I'll gladly take a
            look. Leave me a message and we can decide what it needs.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3 sm:space-x-4">
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-lg sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg/80 dark:text-fg/90 mb-1 text-base font-semibold sm:mb-2">
            Fellow Watchmakers
          </h4>
          <p class="text-fg/80 text-sm leading-relaxed">
            Stuck on something? I'm always up for problem-solving, sharing ideas, or trading notes
            on the bench with fellow craftspeople.
          </p>
        </div>
      </div>

      <div class="flex items-start space-x-3 sm:space-x-4">
        <div class="bg-acc mt-2 h-2 w-2 flex-shrink-0 rounded-lg sm:mt-3"></div>
        <div class="min-w-0 flex-1">
          <h4 class="text-fg/80 dark:text-fg/90 mb-1 text-base font-semibold sm:mb-2">
            Watch Enthusiasts
          </h4>
          <p class="text-fg text-sm leading-relaxed">
            Love watches and want to chat? That's welcome too. Always good to hear from fellow
            enthusiasts about timepieces and horology.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
