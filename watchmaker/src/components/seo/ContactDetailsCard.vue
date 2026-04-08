<script setup>
import { computed } from 'vue'
import { EnvelopeIcon, PhoneIcon } from '@heroicons/vue/24/outline'
import { siteProfile } from '@/seo/siteProfile'
import TheDivider from '@/components/TheDivider.vue'
import CrdDecorCenterDense from '@/components/svgDecor/CrdDecorCenterDense.vue'

const visibleDetails = computed(() => {
  const details = [
    {
      label: 'Email',
      value: siteProfile.email,
      href: siteProfile.email ? `mailto:${siteProfile.email}` : '',
    },
    {
      label: 'Phone',
      value: siteProfile.phone,
      href: siteProfile.phone ? `tel:${siteProfile.phone.replace(/\s+/g, '')}` : '',
    },
    // {
    //   label: 'Workshop',
    //   value: siteProfile.address.publicLabel,
    //   href: siteProfile.address.mapUrl,
    // },
    // {
    //   label: 'Coverage',
    //   value: siteProfile.serviceLabel,
    //   href: '',
    // },
    // {
    //   label: 'Hours',
    //   value: siteProfile.openingHours.join(' · '),
    //   href: '',
    // },
  ]

  return details.filter((detail) => detail.value)
})

const introText = computed(
  () => `${siteProfile.estimates}. ${siteProfile.warranty}. ${siteProfile.postalService}`,
)
</script>

<template>
  <aside class="border-brdr/50 bg-primary/90 relative h-fit self-start overflow-hidden rounded-2xl border p-6 shadow-xl">
    <CrdDecorCenterDense
      class="text-acc pointer-events-none absolute inset-x-0 -bottom-12 h-auto w-full opacity-25 dark:opacity-10"
      aria-hidden="true" />

    <div class="relative z-10 text-center">
      <p class="text-acc font-sec text-sm tracking-widest uppercase">Contact & Service Area</p>
      <h2 class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase">
        {{ siteProfile.businessName }}
      </h2>
      <div class="mt-6">
        <TheDivider variant="sm" />
      </div>
      <p class="text-fg/80 mt-4 leading-relaxed">
        {{ introText }}
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <RouterLink to="/repairs"
          class="items-center text-white gap-2 text-acc mt-4 inline-flex text-sm tracking-wider uppercase transition-colors hover:opacity-80">
          <EnvelopeIcon class="size-4" />
          Start Enquiry
        </RouterLink>
      </div>

      <dl class="mt-6 space-y-4 text-left">
        <div v-for="detail in visibleDetails" :key="detail.label">
          <dt class="text-fg/80 text-xs tracking-wider uppercase">{{ detail.label }}</dt>
          <dd class="text-fg mt-1 leading-relaxed">
            <a v-if="detail.href" :href="detail.href" class="hover:text-acc transition-colors"
              :target="detail.label === 'Workshop' ? '_blank' : undefined"
              :rel="detail.label === 'Workshop' ? 'noopener noreferrer' : undefined">
              {{ detail.value }}
            </a>
            <span v-else>{{ detail.value }}</span>
          </dd>
        </div>
      </dl>
    </div>
  </aside>
</template>
