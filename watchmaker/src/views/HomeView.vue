<script setup>
import { useHead } from '@unhead/vue'
import TopSection from '@/components/home/TopSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import LowerSection from '@/components/home/LowerSection.vue'
import MarketingSections from '@/components/seo/MarketingSections.vue'
import TrustHighlightsBar from '@/components/seo/TrustHighlightsBar.vue'
import QuickLinksGrid from '@/components/seo/QuickLinksGrid.vue'
import { buildHomeHead } from '@/seo/head'
import { getServicePageLinks, homePageContent } from '@/seo/content'
import { siteProfile } from '@/seo/siteProfile'

useHead(buildHomeHead())
</script>

<template>
  <main class="flex flex-col items-center">
    <!-- TOP SECTION -->
    <TopSection></TopSection>

    <section class="w-full max-w-6xl px-6 pt-22">
      <TrustHighlightsBar :items="siteProfile.trustHighlights" />
    </section>

    <!-- SERVICES SECTION -->
    <ServicesSection></ServicesSection>

    <MarketingSections
      :eyebrow="homePageContent.eyebrow"
      :title="homePageContent.title"
      :intro="homePageContent.intro"
      :sections="homePageContent.sections"
      heading-tag="h3"
      variant="split"
    />

    <QuickLinksGrid title="Specialist Service Pages" :items="getServicePageLinks()" />

    <!-- TESTIMONIALS SECTION -->
    <TestimonialSection></TestimonialSection>

    <!-- LOWER SECTION -->
    <LowerSection></LowerSection>
  </main>
</template>
