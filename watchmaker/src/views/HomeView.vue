<script setup>
import { useHead } from '@vueuse/head'
import TopSection from '@/components/home/TopSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import LowerSection from '@/components/home/LowerSection.vue'

useHead({
  title: 'Expert Watch Repair Services | The Watchmaker',
  meta: [
    { name: 'description', content: 'Professional watch repair and restoration services...' },
    { name: 'keywords', content: 'watch repair, timepiece restoration, luxury watch service' }
  ]
})
</script>

<template>
  <main class="flex flex-col items-center sm:py-12">
    <!-- TOP SECTION -->
    <TopSection></TopSection>

    <!-- SERVICES SECTION -->
    <ServicesSection></ServicesSection>

    <!-- TESTIMONIALS SECTION -->
    <TestimonialSection></TestimonialSection>

    <!-- LOWER SECTION -->
    <LowerSection></LowerSection>
  </main>
</template>
