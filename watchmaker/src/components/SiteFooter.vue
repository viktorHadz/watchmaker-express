<template>
  <footer class="border-brdr bg-sec border-t">
    <div class="mx-auto mb-12 max-w-7xl overflow-hidden px-6 py-12 sm:mb-0 lg:px-8">
      <nav
        class="font-sec flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm/6 sm:text-lg"
        aria-label="Footer"
      >
        <router-link
          v-for="item in navigation.main"
          :key="item.name"
          :to="item.href"
          class="text-fg/90 hover:text-acc font-medium transition-colors duration-200"
          >{{ item.name }}</router-link
        >
      </nav>
      <p class="text-fg/80 font-sec text-mini mt-4 text-center font-medium sm:mt-8">
        est. 2024 The Watchmaker
      </p>
    </div>
  </footer>
</template>

<script setup>
const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Contact', href: '/repairs' },
    { name: 'Gallery', href: '/my-work' },
  ],
}
</script>
