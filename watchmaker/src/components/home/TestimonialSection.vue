<script setup>
import { StarIcon } from '@heroicons/vue/24/outline'
</script>
<template>
  <section class="bg-sec/5 mt-20 w-full py-16">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-12 text-center">
        <h2 class="font-sec text-fg mb-4 text-4xl font-semibold">What Clients Say</h2>
        <p class="text-fg/70 text-lg">Trusted by watch enthusiasts and collectors worldwide</p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- Testimonial 1 -->
        <div
          class="bg-primary border-brdr/20 rounded-xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="mb-4 flex items-center">
            <div class="text-acc flex">
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
            </div>
          </div>
          <p class="text-fg/80 mb-4 leading-relaxed italic">
            "Veselin brought my grandfather's Omega back to life. The attention to detail and
            craftsmanship is absolutely incredible. It runs better than when it was new!"
          </p>
          <div class="flex items-center">
            <div class="bg-acc/20 flex h-10 w-10 items-center justify-center rounded-full">
              <span class="text-acc text-sm font-semibold">MR</span>
            </div>
            <div class="ml-3">
              <p class="text-fg font-medium">Michael Rodriguez</p>
              <p class="text-fg/60 text-sm">Watch Collector</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 2 -->
        <div
          class="bg-primary border-brdr/20 rounded-xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="mb-4 flex items-center">
            <div class="text-acc flex">
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
            </div>
          </div>
          <p class="text-fg/80 mb-4 leading-relaxed italic">
            "Professional service and fair pricing. My vintage Seiko looks and performs like new.
            Veselin's expertise with mechanical movements is truly exceptional."
          </p>
          <div class="flex items-center">
            <div class="bg-acc/20 flex h-10 w-10 items-center justify-center rounded-full">
              <span class="text-acc text-sm font-semibold">SL</span>
            </div>
            <div class="ml-3">
              <p class="text-fg font-medium">Sarah Liu</p>
              <p class="text-fg/60 text-sm">Antique Dealer</p>
            </div>
          </div>
        </div>

        <!-- Testimonial 3 -->
        <div
          class="bg-primary border-brdr/20 rounded-xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="mb-4 flex items-center">
            <div class="text-acc flex">
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
              <StarIcon class="fill-acc size-5"></StarIcon>
            </div>
          </div>
          <p class="text-fg/80 mb-4 leading-relaxed italic">
            "Outstanding work on my Rolex restoration. Veselin's knowledge of vintage movements is
            remarkable, and the turnaround time was excellent."
          </p>
          <div class="flex items-center">
            <div class="bg-acc/20 flex h-10 w-10 items-center justify-center rounded-full">
              <span class="text-acc text-sm font-semibold">DJ</span>
            </div>
            <div class="ml-3">
              <p class="text-fg font-medium">David Johnson</p>
              <p class="text-fg/60 text-sm">Estate Attorney</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
