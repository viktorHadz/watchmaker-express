<script setup>
import TheDivider from '@/components/TheDivider.vue'
import CrdDecorCenterFree from '../svgDecor/CrdDecorCenterFree.vue'

defineProps({
  title: {
    type: String,
    default: 'Frequently Asked Questions',
  },
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <section class="mx-auto w-full max-w-5xl px-6 py-12 sm:py-20">
    <div class="text-center">
      <h2
        class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
        {{ title }}
      </h2>
      <div class="mt-5">
        <TheDivider variant="sm" />
      </div>
    </div>

    <div class="mt-10 space-y-4">
      <details v-for="item in items" :key="item.question"
        class="border-brdr/40 bg-primary/85 relative overflow-hidden rounded-lg border">
        <!-- background decor (left + right in ONE layer) -->


        <!-- clickable row -->
        <summary
          class="text-fg font-sec hover:text-acc transition-colors cursor-pointer px-16 py-5 text-center font-medium marker:hidden">
          {{ item.question }}
        </summary>

        <!-- content -->
        <p class="text-fg/80 px-16 pb-5 text-center leading-relaxed">
          {{ item.answer }}
        </p>
      </details>
    </div>
  </section>
</template>
<style scoped>
details>summary {
  list-style: none;
}

details>summary::-webkit-details-marker {
  display: none;
}
</style>