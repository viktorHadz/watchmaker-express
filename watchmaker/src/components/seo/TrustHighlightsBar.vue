<script setup>
import { computed } from 'vue'
import { ClipboardDocumentCheckIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const iconMap = {
  document: ClipboardDocumentCheckIcon,
  shield: ShieldCheckIcon,
  truck: TruckIcon,
}

const normalisedItems = computed(() =>
  props.items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        title: item,
        body: '',
        icon: Object.keys(iconMap)[index] || 'document',
      }
    }

    return {
      title: item.title || '',
      body: item.body || '',
      icon: item.icon || Object.keys(iconMap)[index] || 'document',
    }
  }),
)

const resolveIcon = (name) => iconMap[name] || ClipboardDocumentCheckIcon
</script>

<template>
  <ul class="grid gap-4 md:grid-cols-3" aria-label="Workshop highlights">
    <li v-for="item in normalisedItems" :key="item.title" class="min-w-0 md:h-full">
      <article
        class="border-brdr/50 bg-primary/80 relative h-full overflow-hidden rounded-2xl border px-5 py-5 shadow-lg"
      >
        <div
          class="from-acc/0 via-acc/45 to-acc/0 pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r"
          aria-hidden="true"
        ></div>

        <div class="relative z-10 flex items-start gap-4">
          <div
            class="bg-acc/12 text-acc border-acc/20 flex size-12 shrink-0 items-center justify-center rounded-xl border shadow-md"
          >
            <component :is="resolveIcon(item.icon)" class="size-6" />
          </div>

          <div class="min-w-0">
            <p class="text-fg text-base font-medium tracking-wide">
              {{ item.title }}
            </p>
            <p v-if="item.body" class="text-fg/80 mt-2 text-sm leading-relaxed">
              {{ item.body }}
            </p>
          </div>
        </div>
      </article>
    </li>
  </ul>
</template>
