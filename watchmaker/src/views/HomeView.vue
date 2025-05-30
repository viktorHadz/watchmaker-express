<script setup>
import TopSection from '@/components/home/TopSection.vue'
import ServicesSection from '@/components/home/ServicesSection.vue'
import TestimonialSection from '@/components/home/TestimonialSection.vue'
import LowerSection from '@/components/home/LowerSection.vue'
</script>

<template>
  <main class="flex flex-col items-center">
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
