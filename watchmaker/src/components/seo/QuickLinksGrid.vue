<script setup>
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import TheDivider from '@/components/TheDivider.vue'

defineProps({
  title: {
    type: String,
    default: 'Explore More Services',
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-6 py-8 sm:py-12">
    <header class="text-center">
      <h2
        class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
        {{ title }}
      </h2>
      <div class="mt-5">
        <TheDivider variant="sm" />
      </div>
      <RouterLink to="/repairs"
        class="text-acc mt-4 inline-flex text-sm tracking-wider uppercase transition-colors hover:opacity-80">
        Start An Enquiry
      </RouterLink>
    </header>

    <ul class="mt-8 grid gap-4 md:grid-cols-2 ">
      <li v-for="item in items" :key="item.path">
        <RouterLink :to="item.path"
          class="border-brdr/50 bg-primary/90 hover:border-acc/45 group relative block h-full overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div class="from-acc/0 via-acc/45 to-acc/0 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
            aria-hidden="true"></div>

          <div class="relative z-10 flex items-start justify-between gap-4">
            <h3 class="font-sec text-fg text-lg tracking-wide uppercase">
              {{ item.label }}
            </h3>
            <ArrowRightIcon
              class="text-acc size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          <p class="text-fg/80 relative z-10 mt-3 text-sm leading-relaxed">
            {{ item.description }}
          </p>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
