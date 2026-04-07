<script setup>
import { useHead } from '@unhead/vue'
import TheDivider from '@/components/TheDivider.vue'

useHead({
  title: 'Page Not Found | The Watchmaker',
  meta: [
    {
      name: 'description',
      content:
        'The requested page could not be found. Return to The Watchmaker homepage or browse our repair services.',
    },
    {
      name: 'robots',
      content: 'noindex, follow',
    },
  ],
})
</script>

<template>
  <section
    class="relative flex min-h-[calc(100dvh-16rem)] items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
  >
    <div
      class="card border-brdr/40 relative w-full max-w-4xl overflow-hidden border p-6 text-center shadow-2xl sm:p-10"
    >
      <div
        class="from-acc/12 via-acc/5 absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent"
      ></div>

      <div class="relative mx-auto max-w-2xl">
        <p class="font-sec text-acc text-sm tracking-[0.22em] uppercase">Error 404</p>

        <h1 class="font-sec text-fg mt-4 text-4xl leading-tight font-medium sm:text-6xl">
          Lost in Time
        </h1>

        <div class="mt-6">
          <TheDivider variant="sm" />
        </div>

        <p class="text-fg-mute mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
          This page seems to have slipped between gears. Head back to the workshop or continue to
          the repairs page and we will get you back on track.
        </p>

        <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <RouterLink to="/" class="btn inline-flex items-center justify-center"
            >Back to Home</RouterLink
          >
          <RouterLink
            to="/repairs"
            class="border-brdr bg-primary text-fg hover:bg-sec-light dark:hover:bg-sec-mute inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
          >
            View Repairs
          </RouterLink>
        </div>
      </div>

      <div
        class="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full border border-current/10 opacity-30"
      ></div>
      <div
        class="pointer-events-none absolute -top-10 -left-10 h-24 w-24 rounded-full border border-current/10 opacity-30"
      ></div>
    </div>
  </section>
</template>

<style scoped>
.card {
  animation: card-rise 420ms ease-out;
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
