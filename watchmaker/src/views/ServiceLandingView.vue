<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute } from 'vue-router'
import MarketingSections from '@/components/seo/MarketingSections.vue'
import TrustHighlightsBar from '@/components/seo/TrustHighlightsBar.vue'
import QuickLinksGrid from '@/components/seo/QuickLinksGrid.vue'
import FaqSection from '@/components/seo/FaqSection.vue'
import ContactDetailsCard from '@/components/seo/ContactDetailsCard.vue'
import TheDivider from '@/components/TheDivider.vue'
import { buildServiceHead } from '@/seo/head'
import { getServicePage, getServicePageLinks, servicePageKeys } from '@/seo/content'
import { siteProfile } from '@/seo/siteProfile'
import HandWatch3D from '@/components/svgDecor/HandWatch3D.vue'
import CrdDecorCenterDense from '@/components/svgDecor/CrdDecorCenterDense.vue'

const route = useRoute()
const page = computed(() => getServicePage(route.meta.pageKey))
const serviceEyebrow = computed(() =>
  page.value?.key === 'watchRepairByPost' ? 'UK Postal Service' : 'London Specialist Service',
)

useHead(
  computed(() => {
    if (!page.value) {
      return {}
    }

    return buildServiceHead(page.value.key)
  }),
)

const relatedLinks = computed(() =>
  getServicePageLinks(servicePageKeys.filter((key) => key !== page.value?.key)),
)
</script>

<template>
  <main v-if="page" class="py-12 ">
    <MarketingSections :eyebrow="serviceEyebrow" :title="page.title" :intro="page.hero" :sections="page.sections" />

    <section class="mx-auto w-full max-w-6xl px-6 pt-6 pb-12 sm:pb-20">
      <TrustHighlightsBar :items="siteProfile.trustHighlights" />
    </section>

    <section class="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-5 lg:items-start">
      <div class="lg:col-span-3">
        <div class="text-center">
          <p class="text-acc font-sec text-sm tracking-widest uppercase">Best Next Step</p>
          <h2
            class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
            Start with a repair enquiry
          </h2>
          <div class="mt-6 flex justify-center">
            <TheDivider variant="sm" />
          </div>
        </div>

        <div class="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p class="text-fg leading-relaxed">
              Use the repairs page to send photos, describe the issue, and explain whether the watch
              is in London or elsewhere in the UK. That gives enough context to review the problem
              and advise on the next step properly.
            </p>
            <p v-if="siteProfile.phone" class="text-fg/90 mt-4 max-w-xl text-sm leading-relaxed">
              If the issue is urgent and you are in London, call
              <a :href="`tel:${siteProfile.phone.replace(/\s+/g, '')}`"
                class="text-acc hover:text-acc/80 transition-colors">
                {{ siteProfile.phone }}
              </a>
              first so the watch can be reviewed before any emergency arrangement is discussed.
            </p>
            <div class="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <RouterLink to="/repairs"
                class="bg-acc hover:bg-acc/90 rounded-lg px-5 py-3 text-sm font-medium tracking-wider text-white uppercase transition-colors">
                Go To Repairs
              </RouterLink>
              <RouterLink to="/my-work"
                class="border-brdr text-fg hover:border-acc hover:text-acc rounded-lg border px-5 py-3 text-sm font-medium tracking-wider uppercase transition-colors">
                See Recent Work
              </RouterLink>
            </div>
          </div>

          <div class="relative flex min-h-64 items-center justify-center overflow-hidden rounded-3xl">

            <div class="relative z-10 p-3">
              <HandWatch3D class="size-48 sm:size-56" />
            </div>
          </div>
        </div>
      </div>
      <div class="lg:col-span-2">
        <ContactDetailsCard />
      </div>
    </section>

    <FaqSection :items="page.faqs" />
    <QuickLinksGrid title="Related Services" :items="relatedLinks" />
  </main>
</template>
