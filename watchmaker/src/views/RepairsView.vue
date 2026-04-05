<!-- MAIN ENTRY FILE TEMPLATE -->
<template>
  <div class="relative min-h-screen w-full">
    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="my-4 sm:my-22 text-center">
        <h1 class="font-sec text-fg mb-4 text-center text-2xl font-light tracking-[0.3em] uppercase md:text-4xl">
          Get in Touch
        </h1>
        <TheDivider />
        <p class="text-fg/90 mt-6 mx-auto max-w-3xl  leading-relaxed">
          Ready to restore your timepiece or discuss watchmaking? Let's bring your cherished watches
          back to life.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12 mt-12">
        <!-- Left Column - Get in Touch Info -->
        <div class="lg:col-span-2">
          <GetInTouch></GetInTouch>
        </div>

        <!-- Right Column - Contact Form -->
        <div class="lg:col-span-3">
          <div
            class="bg-primary/90 dark:bg-sec/80 dark:border-sec-mute/50 overflow-hidden rounded-lg  shadow-2xl backdrop-blur-sm">
            <!-- Form Header -->
            <div
              class="from-acc/10 via-acc/5 border-brdr/10 border-b bg-gradient-to-r to-transparent p-8 flex sm:flex-row flex-col justify-between">
              <div>
                <h2 class="font-sec text-fg/90 mb-2 text-2xl font-medium">Send a Message</h2>
                <p class="text-acc text-lg font-light">
                  Tell me about your timepiece and how I can help
                </p>
              </div>
              <p class="dark:text-acc/90 text-fg/90 text-sm sm:text-base text-end">
                Fields marked with <span class="text-lg text-red-500 dark:text-red-400">*</span> are required
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
import TheDivider from '@/components/TheDivider.vue'

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
