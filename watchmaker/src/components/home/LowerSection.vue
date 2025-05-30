<script setup>
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
</script>
<template>
  <section class="mt-20 mb-20 w-full max-w-7xl px-6">
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <!-- Get in Touch Card -->
      <RouterLink to="/repairs">
        <div
          class="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:from-slate-800 dark:to-slate-900"
        >
          <!-- Background Image with Overlay -->
          <div class="absolute inset-0">
            <img
              src="../../assets/pictures/get-in-touch.webp"
              alt="pocket-watch"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width="600"
              height="320"
            />
            <div
              class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 transition-all duration-500 group-hover:from-black/60 group-hover:via-black/40 group-hover:to-black/60"
            ></div>
          </div>
          <!-- Glass Morphism Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 backdrop-blur-[1px] transition-all duration-500 group-hover:backdrop-blur-[2px]"
          ></div>
          <!-- Content -->
          <div class="relative z-10 flex h-80 flex-col justify-between p-8">
            <div class="flex items-start justify-between">
              <div
                class="group-hover:bg-acc/30 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <ChatBubbleLeftEllipsisIcon class="size-6 text-white"></ChatBubbleLeftEllipsisIcon>
              </div>
              <div class="bg-acc h-2 w-2 animate-pulse rounded-full"></div>
            </div>
            <div class="space-y-4">
              <h3
                class="font-sec group-hover:text-acc text-3xl font-semibold text-white transition-colors duration-300"
              >
                Get in Touch
              </h3>
              <p class="text-lg leading-relaxed text-white/80">
                Ready to restore your timepiece? Let's discuss your watch repair needs and bring
                your cherished watches back to life.
              </p>
              <div
                class="flex items-center space-x-2 text-white/60 transition-colors duration-300 group-hover:text-white/80"
              >
                <span class="text-sm font-medium">Schedule consultation</span>
                <svg
                  class="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
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
          </div>
        </div>
      </RouterLink>

      <!-- My Work Card -->
      <RouterLink to="/my-work">
        <div
          class="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:from-slate-800 dark:to-slate-900"
        >
          <div class="absolute inset-0">
            <img
              src="../../assets/pictures/my-work.webp"
              alt="my work"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              width="600"
              height="320"
            />
            <div
              class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 transition-all duration-500 group-hover:from-black/60 group-hover:via-black/40 group-hover:to-black/60"
            ></div>
          </div>
          <!-- Glass Morphism Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 backdrop-blur-[1px] transition-all duration-500 group-hover:backdrop-blur-[2px]"
          ></div>
          <!-- Content -->
          <div class="relative z-10 flex h-80 flex-col justify-between p-8">
            <div class="flex items-start justify-between">
              <div
                class="group-hover:bg-acc/30 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300"
              >
                <svg
                  class="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
              </div>
              <div class="flex space-x-1">
                <div class="bg-acc h-2 w-2 animate-pulse rounded-full"></div>
                <div
                  class="bg-acc/60 h-2 w-2 animate-pulse rounded-full"
                  style="animation-delay: 0.2s"
                ></div>
                <div
                  class="bg-acc/40 h-2 w-2 animate-pulse rounded-full"
                  style="animation-delay: 0.4s"
                ></div>
              </div>
            </div>
            <div class="space-y-4">
              <h3
                class="font-sec group-hover:text-acc text-3xl font-semibold text-white transition-colors duration-300"
              >
                Explore My Work
              </h3>
              <p class="text-lg leading-relaxed text-white/80">
                Discover a gallery of meticulously restored timepieces. Each watch tells a story of
                precision, craftsmanship, and dedication to horological excellence.
              </p>
              <div
                class="flex items-center space-x-2 text-white/60 transition-colors duration-300 group-hover:text-white/80"
              >
                <span class="text-sm font-medium">View portfolio</span>
                <svg
                  class="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1"
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
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
