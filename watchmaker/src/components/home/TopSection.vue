<!-- Top Section - Hero -->
<script setup>
import TheLogo from '../logo/TheLogo.vue'
</script>

<template>
  <section class="relative min-h-[85vh] w-full">
    <!-- Background with subtle texture -->
    <div class="from-primary/50 via-sec-light to-sec absolute inset-0 bg-gradient-to-b">
      <!-- Watch dial texture overlay -->
      <div
        class="absolute inset-0"
        style="
          background-image: radial-gradient(
            circle at center,
            transparent 40%,
            rgba(0, 0, 0, 0.1) 100%
          );
          background-size: 100% 100%;
        "
      ></div>
    </div>

    <!-- Main content -->
    <div class="relative mx-auto max-w-7xl px-6 py-6 sm:py-20">
      <h1
        class="font-sec text-fg mb-4 text-center text-2xl font-light tracking-[0.3em] uppercase md:text-4xl"
      >
        Veselin Hadzhiyski
      </h1>
      <!-- Decorative divider -->
      <div class="flex items-center justify-center space-x-4">
        <div class="to-acc/70 h-px w-16 bg-gradient-to-r from-transparent"></div>
        <div class="flex space-x-2">
          <div class="bg-acc/80 h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
        </div>
        <div class="to-acc/70 h-px w-16 bg-gradient-to-l from-transparent"></div>
      </div>

      <!-- Main hero content -->
      <div class="text-center">
        <!-- Logo -->
        <div class="my-12 flex justify-center">
          <div class="group relative">
            <!-- Glow effect -->
            <div
              class="bg-acc/10 group-hover:bg-acc/20 absolute inset-0 rounded-full blur-3xl transition-all duration-700"
            ></div>

            <TheLogo class="transition-transform duration-500 group-hover:scale-105" />
          </div>
        </div>

        <!-- Title and subtitle -->
        <div class="space-y-6">
          <!-- Decorative divider -->
          <div class="flex items-center justify-center space-x-4">
            <div class="to-acc h-px w-16 bg-gradient-to-r from-transparent"></div>
            <div class="flex space-x-2">
              <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
              <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
              <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
            </div>
            <div class="to-acc h-px w-16 bg-gradient-to-l from-transparent"></div>
          </div>

          <h2 class="font-sec text-fg text-2xl font-light tracking-[0.3em] uppercase md:text-3xl">
            Watchmaker & Repairs
          </h2>

          <p class="text-fg/70 mx-auto max-w-2xl text-lg leading-relaxed">
            Specializing in the restoration and repair of fine mechanical timepieces
          </p>
        </div>

        <!-- Call to action buttons -->
        <div
          class="mt-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6"
        >
          <RouterLink to="/repairs">
            <button
              class="group border-acc bg-acc text-fg2 relative cursor-pointer overflow-hidden border-2 px-8 py-4 transition-all duration-300 hover:shadow-xl"
            >
              <span class="relative font-medium tracking-wide">Schedule Consultation</span>
              <div
                class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              ></div>
            </button>
          </RouterLink>

          <RouterLink to="/my-work">
            <button
              class="group border-brdr text-fg hover:border-acc cursor-pointer border-2 bg-transparent px-8 py-4 transition-all duration-300 hover:shadow-lg"
            >
              <span class="font-medium tracking-wide">View Portfolio</span>
            </button>
          </RouterLink>
        </div>
      </div>

      <!-- Bottom quote section -->
      <div class="mt-24 flex justify-center">
        <div class="max-w-3xl text-center">
          <div
            class="via-brdr/50 mb-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
          ></div>
          <blockquote class="relative">
            <p class="text-fg/60 text-xl leading-relaxed italic">
              "A thing of beauty is a joy forever. In horology, we preserve that joy through
              generations."
            </p>
            <footer class="mt-4">
              <cite class="text-fg-subtle text-sm font-normal not-italic">
                — The Philosophy of Fine Watchmaking
              </cite>
            </footer>
          </blockquote>
          <div
            class="via-brdr/50 mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
