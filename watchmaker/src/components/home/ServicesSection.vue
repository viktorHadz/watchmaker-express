<script setup>
import { WrenchIcon, Cog6ToothIcon, SparklesIcon } from '@heroicons/vue/24/outline'
</script>
<template>
  <section class="mt-16 w-full max-w-7xl px-6">
    <div class="mb-12 text-center">
      <h2 class="font-sec text-fg mb-4 text-4xl font-semibold">Expert Services</h2>
      <p class="text-fg/70 mx-auto max-w-2xl text-lg">
        Comprehensive watch repair and restoration services with decades of experience in precision
        timekeeping
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- Service 1: Movement Restoration -->
      <div
        class="group bg-primary border-brdr/30 hover:border-acc/50 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg"
      >
        <div
          class="bg-acc/10 group-hover:bg-acc/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
        >
          <Cog6ToothIcon class="text-acc size-6"></Cog6ToothIcon>
        </div>
        <h3 class="font-sec text-fg mb-3 text-xl font-semibold">Movement Restoration</h3>
        <p class="text-fg/70 leading-relaxed">
          Complete mechanical movement servicing, cleaning, and calibration to restore your
          timepiece to factory precision.
        </p>
      </div>

      <!-- Service 2: Dial Refinishing -->
      <div
        class="group bg-primary border-brdr/30 hover:border-acc/50 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg"
      >
        <div
          class="bg-acc/10 group-hover:bg-acc/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
        >
          <WrenchIcon class="text-acc size-6"></WrenchIcon>
        </div>
        <h3 class="font-sec text-fg mb-3 text-xl font-semibold">Dial Refinishing</h3>
        <p class="text-fg/70 leading-relaxed">
          Expert restoration of watch dials, hands, and indices to bring back the original beauty
          and legibility.
        </p>
      </div>

      <!-- Service 3: Case Polishing -->
      <div
        class="group bg-primary border-brdr/30 hover:border-acc/50 rounded-xl border p-6 transition-all duration-300 hover:shadow-lg"
      >
        <div
          class="bg-acc/10 group-hover:bg-acc/20 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300"
        >
          <SparklesIcon class="text-acc size-6"></SparklesIcon>
        </div>
        <h3 class="font-sec text-fg mb-3 text-xl font-semibold">Case Polishing</h3>
        <p class="text-fg/70 leading-relaxed">
          Professional case refinishing and bracelet restoration to eliminate scratches and restore
          original luster.
        </p>
      </div>
    </div>
  </section>
</template>
