<!-- Top Section - Hero -->
<script setup>
import TheLogo from '../logo/TheLogo.vue'
import TheDivider from '../TheDivider.vue'
import { siteProfile } from '@/seo/siteProfile'
</script>

<template>
  <section class="relative flex min-h-[calc(100dvh-6rem)] w-full items-center">
    <!-- Background with subtle texture -->
    <div class="from-primary/50 via-sec-light to-sec absolute inset-0 bg-gradient-to-b">
      <!-- Watch dial texture overlay -->
      <div class="absolute inset-0" style="
          background-image: radial-gradient(
            circle at center,
            transparent 40%,
            rgba(0, 0, 0, 0.1) 100%
          );
          background-size: 100% 100%;
        "></div>
    </div>

    <!-- Main content -->
    <div class="relative mx-auto w-full max-w-7xl px-6 py-12 sm:py-36">
      <h1
        class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
        Vintage & Mechanical Watch Repair London
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
              class="bg-acc/10 group-hover:bg-acc/20 absolute inset-0 rounded-lg blur-3xl transition-all duration-500">
            </div>
            <TheLogo class="size-64" />
          </div>
        </div>

        <!-- Title and subtitle -->
        <div class="space-y-6">
          <TheDivider />

          <p class="font-sec text-fg dark:text-fg2 text-xl font-light tracking-[0.24em] uppercase md:text-2xl">
            Veselin Hadzhiyski · Independent Watchmaker
          </p>

          <p class="text-fg mx-auto max-w-2xl text-lg leading-relaxed">
            London-based watch repair and restoration, working with clients across the UK.
          </p>
          <p v-if="siteProfile.phone" class="text-fg/90 mx-auto max-w-2xl text-sm leading-relaxed">
            In London and need it looked at quickly? Call
            <a :href="`tel:${siteProfile.phone.replace(/\s+/g, '')}`" class="text-acc">
              {{ siteProfile.phone }}
            </a>
            .
          </p>
        </div>

        <!-- Call to action buttons -->
        <div class="mt-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <RouterLink to="/repairs"
            class="group border-acc bg-acc dark:bg-acc/80 relative inline-flex items-center justify-center overflow-hidden border-2 px-8 py-4 text-white transition-all duration-300 hover:shadow-xl">
            <span class="relative font-medium tracking-wide">Start Repair Enquiry</span>
            <div
              class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full">
            </div>
          </RouterLink>

          <RouterLink to="/my-work"
            class="group border-brdr text-fg hover:border-acc inline-flex items-center justify-center border-2 bg-transparent px-8 py-4 transition-all duration-300 hover:shadow-lg">
            <span class="font-medium tracking-wide">See Recent Work</span>
          </RouterLink>
        </div>
      </div>

      <!-- Bottom quote section -->
      <div class="mt-12 flex justify-center sm:mt-24">
        <div class="max-w-3xl text-center">
          <div class="bg-acc/40 dark:bg-acc/20 mb-4 h-px w-full mask-x-from-60% mask-x-to-transparent mask-center">
          </div>

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
          <div class="bg-acc/40 dark:bg-acc/20 mt-4 h-px w-full mask-x-from-60% mask-x-to-transparent mask-center">
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
