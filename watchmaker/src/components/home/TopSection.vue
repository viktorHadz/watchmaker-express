<!-- Top Section - Hero -->
<script setup>
import TheLogo from '../logo/TheLogo.vue'
import TheDivider from '../TheDivider.vue'
</script>

<template>
  <section class="relative flex min-h-[calc(100dvh-6rem)] w-full items-center">
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
    <div class="relative mx-auto w-full max-w-7xl px-6 py-12 sm:py-36">
      <h1
        class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-[0.3em] uppercase md:text-4xl"
      >
        Veselin Hadzhiyski
      </h1>
      <!-- Decorative divider -->
      <TheDivider />

      <!-- Main hero content -->
      <div class="text-center">
        <!-- Logo -->
        <div class="my-6 flex justify-center sm:my-12">
          <div class="group relative">
            <!-- Glow effect -->
            <div
              class="dark:bg-acc/10 group-hover:dark:bg-acc/20 bg-acc/20 group-hover:bg-acc/30 absolute inset-0 rounded-lg blur-3xl transition-all duration-500"
            ></div>
            <TheLogo class="size-64 transition-transform duration-500 group-hover:scale-[101%]" />
          </div>
        </div>

        <!-- Title and subtitle -->
        <div class="space-y-6">
          <!-- Decorative divider -->
          <TheDivider />

          <h2
            class="font-sec text-fg dark:text-fg2 text-2xl font-light tracking-[0.3em] uppercase md:text-3xl"
          >
            Watchmaker & Repairs
          </h2>

          <p class="text-fg mx-auto max-w-2xl text-lg leading-relaxed">
            Specializing in the restoration and repair of fine mechanical timepieces
          </p>
        </div>

        <!-- Call to action buttons -->
        <div
          class="mt-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6"
        >
          <RouterLink to="/repairs">
            <button
              class="group border-acc bg-acc dark:bg-acc/80 relative cursor-pointer overflow-hidden border-2 px-8 py-4 text-white transition-all duration-300 hover:shadow-xl"
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
      <div class="mt-12 flex justify-center sm:mt-24">
        <div class="max-w-3xl text-center">
          <div
            class="bg-acc/40 dark:bg-acc/20 mb-4 h-px w-full mask-x-from-60% mask-x-to-transparent mask-center"
          ></div>

          <blockquote class="relative">
            <p class="text-fg leading-relaxed italic">
              "A thing of beauty is a joy forever. In horology, we preserve that joy through
              generations."
            </p>
            <footer class="mt-4">
              <cite class="text-fg/90 text-sm font-normal not-italic">
                — The Philosophy of Fine Watchmaking
              </cite>
            </footer>
          </blockquote>
          <div
            class="bg-acc/40 dark:bg-acc/20 mt-4 h-px w-full mask-x-from-60% mask-x-to-transparent mask-center"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>
