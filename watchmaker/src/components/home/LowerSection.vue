<script setup>
import { ChatBubbleLeftEllipsisIcon, CameraIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <section class="mt-20 mb-20 w-full max-w-7xl px-6">
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Get in Touch Card -->
      <RouterLink to="/repairs" class="group">
        <div
          class="border-brdr/50 bg-primary hover:border-acc/50 relative h-80 overflow-hidden rounded-lg border transition-all duration-500 hover:shadow-2xl"
        >
          <!-- Background Image -->
          <div class="absolute inset-0">
            <img
              src="../../assets/pictures/get-in-touch.webp"
              alt="Vintage pocket watch"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width="600"
              height="320"
            />
            <!-- Elegant gradient overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative flex h-full flex-col justify-between p-4 sm:p-8">
            <!-- Top icon -->
            <div class="flex items-start justify-between">
              <div class="rounded-full border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <ChatBubbleLeftEllipsisIcon class="size-5 text-white" />
              </div>
              <!-- Decorative element -->
              <div class="flex items-center space-x-1">
                <div class="bg-acc h-1 w-1 rounded-full"></div>
                <div class="from-acc h-1 w-8 rounded-full bg-gradient-to-r to-transparent"></div>
              </div>
            </div>

            <!-- Bottom content -->
            <div class="space-y-3">
              <h3 class="font-sec text-2xl font-normal tracking-wide text-white">
                Begin Your Restoration
              </h3>
              <p class="text-base leading-relaxed text-white/80">
                Every timepiece has a story. Let's discuss how we can restore yours to its former
                glory.
              </p>
              <div class="text-acc flex items-center space-x-2">
                <span class="text-sm font-medium tracking-wider uppercase"
                  >Schedule Consultation</span
                >
                <svg
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>

      <!-- My Work Card -->
      <RouterLink to="/my-work" class="group">
        <div
          class="border-brdr/50 bg-primary hover:border-acc/50 relative h-80 overflow-hidden rounded-lg border transition-all duration-500 hover:shadow-2xl"
        >
          <!-- Background Image -->
          <div class="absolute inset-0">
            <img
              src="../../assets/pictures/my-work.webp"
              alt="Watch restoration workspace"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              width="600"
              height="320"
            />
            <!-- Elegant gradient overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            ></div>
          </div>

          <!-- Content -->
          <div class="relative flex h-full flex-col justify-between p-4 sm:p-8">
            <!-- Top icon -->
            <div class="flex items-start justify-between">
              <div class="rounded-full border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                <CameraIcon class="size-5 text-white" />
              </div>
              <!-- Decorative element -->
              <div class="flex items-center space-x-1">
                <div class="from-acc h-1 w-8 rounded-full bg-gradient-to-l to-transparent"></div>
                <div class="bg-acc h-1 w-1 rounded-full"></div>
              </div>
            </div>

            <!-- Bottom content -->
            <div class="space-y-3">
              <h3 class="font-sec text-2xl font-normal tracking-wide text-white">
                Portfolio of Excellence
              </h3>
              <p class="text-base leading-relaxed text-white/80">
                Browse our gallery of meticulously restored timepieces, each a testament to
                precision craftsmanship.
              </p>
              <div class="text-acc flex items-center space-x-2">
                <span class="text-sm font-medium tracking-wider uppercase">View Gallery</span>
                <svg
                  class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Trust indicators -->
    <div class="border-brdr/20 mt-16 border-t pt-16">
      <div class="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
        <div>
          <p class="font-sec text-acc text-3xl font-light">35+</p>
          <p class="text-fg-subtle text-sm tracking-wider uppercase">Years Experience</p>
        </div>
        <div>
          <p class="font-sec text-acc text-3xl font-light">2,500+</p>
          <p class="text-fg-subtle text-sm tracking-wider uppercase">Watches Restored</p>
        </div>
        <div>
          <p class="font-sec text-acc text-3xl font-light">24</p>
          <p class="text-fg-subtle text-sm tracking-wider uppercase">Month Warranty</p>
        </div>
        <div>
          <p class="font-sec text-acc text-3xl font-light">5★</p>
          <p class="text-fg-subtle text-sm tracking-wider uppercase">Average Rating</p>
        </div>
      </div>
    </div>
  </section>
</template>
