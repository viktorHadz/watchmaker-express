<script setup>
import TheLogo from '../logo/TheLogo.vue'
import OmegaLogo from '@/components/brands/OmegaLogo.vue'
import CasioLogo from '@/components/brands/CasioLogo.vue'
import LonginesLogo from '@/components/brands/LonginesLogo.vue'
import RolexLogo from '@/components/brands/RolexLogo.vue'
import SeikoLogo from '@/components/brands/SeikoLogo.vue'
import VostokLogo from '@/components/brands/VostokLogo.vue'
</script>
<template>
  <section class="relative flex min-h-[85vh] items-center justify-center px-6 py-12">
    <!-- Glass morphism container -->
    <div class="relative w-full max-w-6xl">
      <!-- Main hero card -->
      <div
        class="bg-primary/60 border-brdr/20 relative overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-xl"
      >
        <!-- Subtle inner glow -->
        <div
          class="from-acc/5 to-sec/5 absolute inset-0 rounded-3xl bg-gradient-to-br via-transparent"
        ></div>

        <!-- Content grid -->
        <div class="relative z-10 grid grid-cols-1 items-center gap-8 p-8 lg:grid-cols-5 lg:p-12">
          <!-- Left brand column - enhanced -->
          <div class="hidden lg:col-span-1 lg:block">
            <div class="flex flex-col items-center space-y-8">
              <div class="group">
                <OmegaLogo
                  class="text-fg/60 hover:text-acc size-12 cursor-pointer transition-all duration-300 hover:scale-110"
                />
                <div
                  class="via-brdr/30 mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
                ></div>
              </div>
              <div class="group">
                <CasioLogo
                  class="text-fg/60 hover:text-acc size-12 cursor-pointer transition-all duration-300 hover:scale-110"
                />
                <div
                  class="via-brdr/30 mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
                ></div>
              </div>
              <div class="group">
                <LonginesLogo
                  class="text-fg/60 hover:text-acc size-14 cursor-pointer transition-all duration-300 hover:scale-110"
                />
              </div>
            </div>
          </div>

          <!-- Center content -->
          <div class="space-y-8 text-center lg:col-span-3">
            <!-- Main title -->
            <div class="space-y-4">
              <h1
                class="font-sec text-fg dark:text-fg2/90 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
              >
                Veselin Hadzhiyski
              </h1>
              <div class="flex items-center justify-center space-x-4">
                <div class="to-acc h-px w-12 bg-gradient-to-r from-transparent"></div>
                <div class="bg-acc h-2 w-2 animate-pulse rounded-full"></div>
                <div class="to-acc h-px w-12 bg-gradient-to-l from-transparent"></div>
              </div>
            </div>

            <!-- Logo with elegant frame -->
            <div class="flex justify-center">
              <div class="group relative">
                <div
                  class="from-acc/20 to-sec/20 absolute inset-0 rounded-full bg-gradient-to-br opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                ></div>
                <div
                  class="bg-primary/80 border-brdr/30 relative rounded-full border p-6 shadow-lg backdrop-blur-sm"
                >
                  <TheLogo class="transition-transform duration-300 group-hover:scale-105" />
                </div>
              </div>
            </div>

            <!-- Subtitle with refined typography -->
            <div class="space-y-2 pb-4">
              <h2
                class="font-sec text-fg dark:text-fg2/90 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
              >
                Watchmaker & Repairs
              </h2>
              <p class="text-fg/70 mx-auto max-w-2xl text-lg leading-relaxed">
                Precision craftsmanship meets timeless tradition in the art of horological
                restoration
              </p>
            </div>

            <!-- Call to action -->
            <RouterLink to="/repairs">
              <button
                class="group bg-acc hover:bg-acc/90 text-fg2 relative overflow-hidden rounded-xl px-8 py-4 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg dark:hover:text-white"
              >
                <span class="relative z-10">Start Your Restoration</span>
                <div
                  class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                ></div>
              </button>
            </RouterLink>
          </div>

          <!-- Right brand column - enhanced -->
          <div class="hidden lg:col-span-1 lg:block">
            <div class="flex flex-col items-center space-y-8">
              <div class="group">
                <RolexLogo
                  class="text-fg/60 hover:text-acc size-12 cursor-pointer transition-all duration-300 hover:scale-110"
                />
                <div
                  class="via-brdr/30 mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
                ></div>
              </div>
              <div class="group">
                <SeikoLogo
                  class="text-fg/60 hover:text-acc size-12 cursor-pointer transition-all duration-300 hover:scale-110"
                />
                <div
                  class="via-brdr/30 mt-4 h-px w-full bg-gradient-to-r from-transparent to-transparent"
                ></div>
              </div>
              <div class="group">
                <VostokLogo
                  class="text-fg/60 hover:text-acc size-12 cursor-pointer transition-all duration-300 hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile brand showcase -->
        <div class="border-brdr/20 border-t p-6 lg:hidden">
          <div class="flex items-center justify-center space-x-8 opacity-60">
            <OmegaLogo class="hover:text-acc size-8 transition-colors duration-300" />
            <CasioLogo class="hover:text-acc size-8 transition-colors duration-300" />
            <LonginesLogo class="hover:text-acc size-9 transition-colors duration-300" />
            <RolexLogo class="hover:text-acc size-8 transition-colors duration-300" />
            <SeikoLogo class="hover:text-acc size-8 transition-colors duration-300" />
            <VostokLogo class="hover:text-acc size-8 transition-colors duration-300" />
          </div>
        </div>
      </div>

      <!-- Floating quote card -->
      <div class="relative mx-auto mt-12 max-w-2xl">
        <div class="bg-primary/40 border-brdr/20 rounded-2xl border p-8 shadow-xl backdrop-blur-lg">
          <blockquote class="text-center">
            <div class="relative">
              <span class="text-acc/60 absolute -top-4 -left-2 font-serif text-6xl">"</span>
              <p class="text-fg px-6 text-xl leading-relaxed font-light italic md:text-2xl">
                Time is the wisest counselor of all.
              </p>
              <span class="text-acc/60 absolute -right-2 -bottom-8 rotate-180 font-serif text-6xl"
                >"</span
              >
            </div>
            <footer class="border-brdr/20 mt-6 border-t pt-4">
              <cite class="text-fg/70 text-lg font-medium not-italic">— Pericles</cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  </section>
</template>
