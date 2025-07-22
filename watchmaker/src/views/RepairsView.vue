<!-- MAIN ENTRY FILE TEMPLATE -->
<template>
  <div class="relative min-h-screen w-full">
    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-16 text-center">
        <h1 class="font-sec text-fg dark:text-fg mb-4 text-4xl font-medium lg:text-5xl">
          Get in Touch
        </h1>
        <div class="mb-6 flex items-center justify-center space-x-4">
          <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
          <div class="flex space-x-1">
            <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
          </div>
          <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
        </div>
        <p class="text-fg/70 mx-auto max-w-3xl text-xl leading-relaxed">
          Ready to restore your timepiece or discuss watchmaking? Let's bring your cherished watches
          back to life.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
        <!-- Left Column - Get in Touch Info -->
        <div class="lg:col-span-2">
          <GetInTouch></GetInTouch>
        </div>

        <!-- Right Column - Contact Form -->
        <div class="lg:col-span-3">
          <div
            class="bg-primary/90 dark:bg-sec/90 dark:border-sec-mute/50 overflow-hidden rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm"
          >
            <!-- Form Header -->
            <div
              class="from-acc/10 via-acc/5 border-brdr/10 border-b bg-gradient-to-r to-transparent p-8"
            >
              <h2 class="font-sec text-fg mb-2 text-2xl font-semibold">Send a Message</h2>
              <p class="text-acc text-lg font-light">
                Tell me about your timepiece and how I can help
              </p>
            </div>

            <!-- CONTACT FORM  -->
            <ContactForm></ContactForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@vueuse/head'
import GetInTouch from '@/components/GetInTouch.vue'
import ContactForm from '@/components/ContactForm.vue'

useHead({
  title: 'Watch Repair Services & Contact | The Watchmaker',
  meta: [
    { name: 'description', content: 'Contact us for professional watch repair services. Expert restoration of luxury and vintage timepieces with free estimates.' },
    { name: 'keywords', content: 'watch repair contact, timepiece restoration quote, luxury watch service UK' }
  ]
})
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
