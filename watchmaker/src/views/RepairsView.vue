<template>
  <div class="relative min-h-screen w-full">
    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="my-4 text-center sm:my-22">
        <h1
          class="font-sec text-fg dark:text-fg2 mb-4 text-center text-2xl font-light tracking-wide uppercase md:text-4xl"
        >
          Get in Touch
        </h1>
        <TheDivider />
        <p class="text-fg mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          Ready to restore your timepiece or discuss watchmaking? Let's bring your cherished watches
          back to life.
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
            class="bg-primary/90 dark:bg-sec/80 dark:border-sec-mute/50 overflow-hidden rounded-lg shadow-2xl backdrop-blur-sm"
          >
            <!-- Form Header -->
            <div
              class="from-acc/10 via-acc/5 border-brdr/10 flex flex-col-reverse justify-between border-b bg-gradient-to-r to-transparent sm:flex-row md:p-4"
            >
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
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import GetInTouch from '@/components/GetInTouch.vue'
import ContactForm from '@/components/ContactForm.vue'
import TheDivider from '@/components/TheDivider.vue'

useHead({
  title: 'Watch Repair Services & Contact | The Watchmaker',
  meta: [
    {
      name: 'description',
      content:
        'Contact us for professional watch repair services. Expert restoration of luxury and vintage timepieces with free estimates.',
    },
    {
      name: 'keywords',
      content: 'watch repair contact, timepiece restoration quote, luxury watch service UK',
    },
  ],
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
