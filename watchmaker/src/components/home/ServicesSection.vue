<script setup>
import { WrenchIcon, Cog6ToothIcon, SparklesIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <section class="mt-16 w-full max-w-7xl px-6">
    <!-- Section Header -->
    <div class="mb-16 text-center">
      <h2 class="font-sec text-fg mb-2 text-4xl font-normal tracking-wide">Horological Services</h2>
      <div class="mb-6 flex items-center justify-center space-x-4">
        <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
        <div class="flex space-x-1">
          <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
        </div>
        <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
      </div>
      <p class="text-fg/70 mx-auto max-w-2xl text-lg leading-relaxed">
        Preserving the art of mechanical timekeeping through meticulous restoration and expert
        servicing
      </p>
    </div>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <!-- Service 1: Movement Restoration -->
      <div class="group relative">
        <!-- Card background with subtle gradient -->
        <div
          class="from-primary to-sec-light absolute inset-0 rounded-lg bg-gradient-to-br opacity-50"
        ></div>

        <div
          class="bg-primary/90 border-brdr/50 hover:border-acc/30 relative h-full rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
        >
          <!-- Icon with brass accent -->
          <div class="mb-6 inline-flex">
            <div class="relative">
              <div
                class="bg-acc/20 group-hover:bg-acc/30 absolute inset-0 rounded-full blur-xl transition-colors duration-500"
              ></div>
              <div
                class="bg-acc/10 border-acc/20 group-hover:border-acc/40 relative rounded-full border p-4 transition-all duration-300"
              >
                <Cog6ToothIcon class="text-acc size-6" />
              </div>
            </div>
          </div>

          <h3 class="font-sec text-fg mb-4 text-xl font-normal tracking-wide">
            Movement Restoration
          </h3>
          <p class="text-fg/70 leading-relaxed">
            Complete overhaul of mechanical movements including disassembly, ultrasonic cleaning,
            lubrication, and precision timing adjustment to restore factory specifications.
          </p>
        </div>
      </div>

      <!-- Service 2: Dial & Hand Refinishing -->
      <div class="group relative">
        <div
          class="from-primary to-sec-light absolute inset-0 rounded-lg bg-gradient-to-br opacity-50"
        ></div>

        <div
          class="bg-primary/90 border-brdr/50 hover:border-acc/30 relative h-full rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
        >
          <div class="mb-6 inline-flex">
            <div class="relative">
              <div
                class="bg-acc/20 group-hover:bg-acc/30 absolute inset-0 rounded-full blur-xl transition-colors duration-500"
              ></div>
              <div
                class="bg-acc/10 border-acc/20 group-hover:border-acc/40 relative rounded-full border p-4 transition-all duration-300"
              >
                <WrenchIcon class="text-acc size-6" />
              </div>
            </div>
          </div>

          <h3 class="font-sec text-fg mb-4 text-xl font-normal tracking-wide">
            Dial & Hand Refinishing
          </h3>
          <p class="text-fg/70 leading-relaxed">
            Expert restoration of vintage dials, careful hand relumeing, and index marker
            refinishing while preserving the original character and patina of your timepiece.
          </p>
        </div>
      </div>

      <!-- Service 3: Case & Bracelet Restoration -->
      <div class="group relative">
        <div
          class="from-primary to-sec-light absolute inset-0 rounded-lg bg-gradient-to-br opacity-50"
        ></div>

        <div
          class="bg-primary/90 border-brdr/50 hover:border-acc/30 relative rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
        >
          <div class="mb-6 inline-flex">
            <div class="relative">
              <div
                class="bg-acc/20 group-hover:bg-acc/30 absolute inset-0 rounded-full blur-xl transition-colors duration-500"
              ></div>
              <div
                class="bg-acc/10 border-acc/20 group-hover:border-acc/40 relative rounded-full border p-4 transition-all duration-300"
              >
                <SparklesIcon class="text-acc size-6" />
              </div>
            </div>
          </div>

          <h3 class="font-sec text-fg mb-4 text-xl font-normal tracking-wide">
            Case & Bracelet Restoration
          </h3>
          <p class="text-fg/70 leading-relaxed">
            Professional refinishing of watch cases and bracelets using traditional techniques to
            restore original finishing while maintaining crisp edges and factory specifications.
          </p>
        </div>
      </div>
    </div>

    <!-- Additional Service Note -->
    <div class="mt-12 text-center">
      <p class="text-fg-subtle text-sm">
        All services include a comprehensive 24-month warranty · Free estimates available
      </p>
    </div>
  </section>
</template>
