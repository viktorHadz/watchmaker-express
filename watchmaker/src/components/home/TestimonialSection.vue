<script setup>
import { StarIcon } from '@heroicons/vue/24/solid'
</script>

<template>
  <section class="mt-20 w-full py-16">
    <div class="relative mx-auto max-w-7xl px-6">
      <!-- Section Header -->
      <div class="mb-16 text-center">
        <h2 class="font-sec text-fg mb-2 text-4xl font-normal tracking-wide">
          Client Testimonials
        </h2>
        <div class="mb-6 flex items-center justify-center space-x-4">
          <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
          <div class="flex space-x-1">
            <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
          </div>
          <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
        </div>
        <p class="text-fg/70 text-lg">Trusted by collectors and enthusiasts for three decades</p>
      </div>

      <!-- Testimonials Grid -->
      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Testimonial 1 -->
        <div class="group">
          <div
            class="bg-primary/80 border-brdr/30 hover:border-acc/20 relative h-full rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
          >
            <!-- Decorative quote mark -->
            <div class="text-acc/10 absolute -top-2 -left-2 font-serif text-6xl leading-none">
              "
            </div>

            <!-- Stars -->
            <div class="mb-4 flex space-x-0.5">
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
            </div>

            <!-- Testimonial text -->
            <p class="text-fg/80 mb-6 leading-relaxed italic">
              "Veselin restored my grandfather's 1954 Omega Seamaster to perfection. His attention
              to detail and respect for the watch's heritage is unmatched. It now keeps better time
              than when new."
            </p>

            <!-- Author -->
            <div class="border-brdr/20 border-t pt-4">
              <p class="text-fg font-medium">Michael Rodriguez</p>
              <p class="text-fg-subtle text-sm">Vintage Watch Collector</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div class="group">
          <div
            class="bg-primary/80 border-brdr/30 hover:border-acc/20 relative h-full rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
          >
            <div class="text-acc/10 absolute -top-2 -left-2 font-serif text-6xl leading-none">
              "
            </div>

            <div class="mb-4 flex space-x-0.5">
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
            </div>

            <p class="text-fg/80 mb-6 leading-relaxed italic">
              "Professional expertise combined with fair pricing. My vintage Seiko required
              extensive work, and Veselin explained every step. The results exceeded my
              expectations."
            </p>

            <div class="border-brdr/20 border-t pt-4">
              <p class="text-fg font-medium">Sarah Liu</p>
              <p class="text-fg-subtle text-sm">Estate Jewelry Specialist</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 3 -->
        <div class="group">
          <div
            class="bg-primary/80 border-brdr/30 hover:border-acc/20 relative h-full rounded-lg border p-8 transition-all duration-500 hover:shadow-xl"
          >
            <div class="text-acc/10 absolute -top-2 -left-2 font-serif text-6xl leading-none">
              "
            </div>

            <div class="mb-4 flex space-x-0.5">
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
              <StarIcon class="text-acc size-4" />
            </div>

            <p class="text-fg/80 mb-6 leading-relaxed italic">
              "Outstanding restoration of my 1960s Rolex Datejust. Veselin's knowledge of vintage
              movements is encyclopedic, and his craftsmanship is truly masterful."
            </p>

            <div class="border-brdr/20 border-t pt-4">
              <p class="text-fg font-medium">David Johnson</p>
              <p class="text-fg-subtle text-sm">Private Collector</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
