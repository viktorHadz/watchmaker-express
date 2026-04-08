<script setup>
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import GalleryEl from '@/components/Gallery/GalleryEl.vue'
import { usePostsStore } from '@/stores/usePostsStore'
import { buildGalleryHead } from '@/seo/head'

useHead(buildGalleryHead())

const postsStore = usePostsStore()

onMounted(async () => {
  await postsStore.initialize()
})
</script>

<template>
  <GalleryEl />
</template>
