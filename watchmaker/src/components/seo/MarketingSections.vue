<script setup>
import { MagnifyingGlassIcon, SparklesIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import TheDivider from '@/components/TheDivider.vue'
import HandWatch3D from '@/components/svgDecor/HandWatch3D.vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  intro: {
    type: String,
    default: '',
  },
  sections: {
    type: Array,
    default: () => [],
  },
  headingTag: {
    type: String,
    default: 'h1',
  },
  variant: {
    type: String,
    default: 'cards',
  },
})

const sectionIcons = [MagnifyingGlassIcon, WrenchScrewdriverIcon, SparklesIcon]
const resolveIcon = (index) => sectionIcons[index % sectionIcons.length]
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-6 py-12 sm:py-20">
    <div v-if="variant === 'split'"
      class="mx-auto grid max-w-6xl gap-14 text-center lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:text-left">
      <div class="mx-auto flex max-w-2xl flex-col items-center lg:mx-0 lg:items-start lg:pr-8">
        <p v-if="eyebrow" class="text-acc font-sec text-sm tracking-widest uppercase">
          {{ eyebrow }}
        </p>

        <component :is="headingTag"
          class="font-sec text-fg dark:text-fg2 mt-3 text-2xl font-light tracking-wide uppercase md:text-4xl">
          {{ title }}
        </component>

        <div class="mt-6 flex justify-center lg:justify-start" aria-hidden="true">
          <TheDivider />
        </div>

        <p v-if="intro" class="text-fg/85 mt-6 max-w-xl text-lg leading-relaxed">
          {{ intro }}
        </p>

        <div class="mt-10 flex justify-center lg:justify-start">
          <HandWatch3D class="size-64" />
        </div>
      </div>

      <div
        class="border-brdr/50 divide-brdr/50 dark:border-acc/20 dark:divide-acc/20 mx-auto w-full max-w-2xl divide-y border-y lg:mx-0 lg:max-w-none">
        <article v-for="(section, index) in props.sections" :key="section.heading"
          class="flex gap-4 px-1 py-6 text-left sm:gap-6">
          <div class="text-acc flex size-11 shrink-0 items-center justify-center">
            <component :is="resolveIcon(index)" class="size-6" />
          </div>

          <div class="min-w-0 flex-1">
            <h3 class="font-sec text-fg dark:text-fg2 text-lg font-normal tracking-wide">
              {{ section.heading }}
            </h3>
            <p class="text-fg/80 mt-2 leading-relaxed">
              {{ section.body }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <template v-else>
      <div class="text-center">
        <p v-if="eyebrow" class="text-acc font-sec text-sm tracking-widest uppercase">
          {{ eyebrow }}
        </p>
        <component :is="headingTag"
          class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
          {{ title }}
        </component>
        <div class="mt-6">
          <TheDivider variant="sm" />
        </div>
        <p v-if="intro" class="text-fg/85 mx-auto mt-6 max-w-3xl text-lg leading-relaxed">
          {{ intro }}
        </p>
      </div>

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <article v-for="(section, index) in props.sections" :key="section.heading"
          class="border-brdr/50 bg-primary/90 group relative overflow-hidden rounded-2xl border p-6 shadow-lg transition-transform duration-300 hover:-translate-y-1">
          <div class="from-acc/0 via-acc/45 to-acc/0 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
            aria-hidden="true"></div>

          <div
            class="bg-acc/12 text-acc border-acc/20 relative z-10 mb-6 flex size-12 items-center justify-center rounded-xl border shadow-md">
            <component :is="resolveIcon(index)" class="size-6" />
          </div>

          <h3 class="font-sec text-fg mb-4 text-xl font-normal tracking-wide">
            {{ section.heading }}
          </h3>
          <p class="text-fg/80 relative z-10 mt-4 leading-relaxed">
            {{ section.body }}
          </p>
        </article>
      </div>
    </template>
  </section>
</template>
