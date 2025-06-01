<!-- MAIN ENTRY FILE TEMPLATE -->
<template>
  <div class="relative min-h-screen w-full">
    <div class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="mb-16 text-center">
        <h1 class="font-sec text-fg mb-4 text-4xl font-semibold lg:text-5xl">Get in Touch</h1>
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
              <h3 class="font-sec text-fg mb-2 text-2xl font-semibold">Send a Message</h3>
              <p class="text-fg/70">Tell me about your timepiece and how I can help</p>
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
import GetInTouch from '@/components/GetInTouch.vue'
import ContactForm from '@/components/ContactForm.vue'
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
