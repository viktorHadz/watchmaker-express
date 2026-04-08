<template>
  <footer class="border-brdr bg-sec border-t">
    <div class="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <section>
          <p class="text-acc font-sec text-sm tracking-[0.22em] uppercase">The Watchmaker</p>
          <h2 class="font-sec text-fg mt-4 text-2xl font-light tracking-[0.1em] uppercase">
            Vintage & Mechanical Watch Repair In London
          </h2>
          <p class="text-fg/80 mt-4 max-w-xl leading-relaxed">
            Independent watch repair, servicing, and restoration for mechanical and vintage
            timepieces, with London-based support and UK-wide postal repairs available after an
            initial enquiry.
          </p>
          <div class="text-fg/80 mt-5 space-y-2 text-sm leading-relaxed">
            <p v-if="siteProfile.email">
              <a :href="`mailto:${siteProfile.email}`" class="hover:text-acc transition-colors">
                {{ siteProfile.email }}
              </a>
            </p>
            <p v-if="siteProfile.phone">
              <a
                :href="`tel:${siteProfile.phone.replace(/\s+/g, '')}`"
                class="hover:text-acc transition-colors"
              >
                {{ siteProfile.phone }}
              </a>
            </p>
            <p>
              <a
                v-if="siteProfile.address.mapUrl"
                :href="siteProfile.address.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-acc transition-colors"
              >
                {{ siteProfile.address.publicLabel }}
              </a>
              <span v-else>{{ siteProfile.address.publicLabel }}</span>
            </p>
            <p>{{ siteProfile.openingHours.join(' · ') }}</p>
          </div>
        </section>

        <nav aria-label="Footer navigation">
          <p class="text-acc font-sec text-sm tracking-[0.22em] uppercase">Browse</p>
          <div class="mt-4 flex flex-col gap-3">
            <router-link
              v-for="item in navigation.main"
              :key="item.name"
              :to="item.href"
              class="text-fg/90 hover:text-acc font-medium transition-colors duration-200"
            >
              {{ item.name }}
            </router-link>
          </div>
        </nav>

        <nav aria-label="Service pages">
          <p class="text-acc font-sec text-sm tracking-[0.22em] uppercase">Popular Services</p>
          <div class="mt-4 flex flex-col gap-3">
            <router-link
              v-for="item in serviceLinks"
              :key="item.path"
              :to="item.path"
              class="text-fg/90 hover:text-acc transition-colors duration-200"
            >
              {{ item.label }}
            </router-link>
          </div>
        </nav>
      </div>

      <p class="text-fg/80 font-sec text-mini mt-10 text-center font-medium">
        est. 2024 The Watchmaker
      </p>
    </div>
  </footer>
</template>

<script setup>
import { footerServiceLinks, getServicePageLinks } from '@/seo/content'
import { siteProfile } from '@/seo/siteProfile'

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Repairs & Estimates', href: '/repairs' },
    { name: 'Workshop Gallery', href: '/my-work' },
  ],
}

const serviceLinks = getServicePageLinks(footerServiceLinks)
</script>
