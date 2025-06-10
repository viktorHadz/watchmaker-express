<script setup>
import NewGalleryElement from '@/components/Gallery/AdminNewPost.vue'
import GalleryEl from '@/components/Gallery/GalleryEl.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
</script>

<template>
  <div>
    <div class="relative mx-auto" v-if="isAuthenticated">
      <NewGalleryElement></NewGalleryElement>
    </div>
    <GalleryEl></GalleryEl>
  </div>
</template>
