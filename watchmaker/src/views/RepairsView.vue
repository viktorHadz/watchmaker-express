<template>
  <div class="relative min-h-screen w-full pb-16">
    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="my-4 text-center sm:my-22">
        <h1
          class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl">
          Watch Repair Enquiries & Estimates
        </h1>
        <TheDivider />
        <p class="text-fg mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          Send photos, describe the issue, and start the estimate process for London enquiries or
          postal repairs from elsewhere in the UK.
        </p>

      </div>

      <div class="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-12">
        <!-- Left Column - Get in Touch Info -->
        <div class="self-start lg:sticky lg:top-80 lg:col-span-2">
          <GetInTouch></GetInTouch>
        </div>

        <!-- Right Column - Contact Form -->
        <div class="lg:col-span-3">
          <div
            class="bg-primary/90 dark:bg-sec/80 dark:border-sec-mute/50 overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm">
            <!-- Form Header -->
            <div
              class="from-acc/10 via-acc/5 border-brdr/10 flex flex-col-reverse justify-between border-b bg-gradient-to-r to-transparent sm:flex-row md:p-4">
              <div class="px-4 pb-4 sm:py-4">
                <h2 class="font-sec text-fg text-lg leading-tight font-medium sm:text-2xl">
                  Send a Message
                </h2>
                <p class="text-acc text-base font-light sm:text-lg">
                  Tell me about your timepiece and how I can help
                </p>
              </div>
              <p class="dark:text-acc/90 text-fg px-2 text-end text-sm sm:text-base">
                Fields marked with <span class="text-lg text-red-500 dark:text-red-400">*</span> are
                required
              </p>
            </div>

            <!-- CONTACT FORM  -->
            <ContactForm></ContactForm>
          </div>
        </div>
      </div>
    </div>

    <section class="mx-auto w-full max-w-6xl px-6">
      <TrustHighlightsBar :items="siteProfile.trustHighlights" />
    </section>

    <MarketingSections :eyebrow="repairsPageContent.eyebrow" :title="repairsPageContent.title"
      :intro="repairsPageContent.intro" :sections="repairsPageContent.sections" heading-tag="h2" />

    <section class="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.8fr]">
      <QuickLinksGrid title="Service Pages To Explore" :items="getServicePageLinks()" />
      <ContactDetailsCard />
    </section>

    <FaqSection :items="repairsPageContent.faqs" />
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import GetInTouch from '@/components/GetInTouch.vue'
import ContactForm from '@/components/ContactForm.vue'
import TheDivider from '@/components/TheDivider.vue'
import MarketingSections from '@/components/seo/MarketingSections.vue'
import TrustHighlightsBar from '@/components/seo/TrustHighlightsBar.vue'
import QuickLinksGrid from '@/components/seo/QuickLinksGrid.vue'
import FaqSection from '@/components/seo/FaqSection.vue'
import ContactDetailsCard from '@/components/seo/ContactDetailsCard.vue'
import { buildRepairsHead } from '@/seo/head'
import { getServicePageLinks, repairsPageContent } from '@/seo/content'
import { siteProfile } from '@/seo/siteProfile'

useHead(buildRepairsHead())
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
