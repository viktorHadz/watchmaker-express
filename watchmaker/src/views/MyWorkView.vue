<script setup>
import { onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import GalleryEl from '@/components/Gallery/GalleryEl.vue'
import { usePostsStore } from '@/stores/usePostsStore'

useHead({
  title: 'Watch Repair Gallery | The Watchmaker',
  meta: [
    {
      name: 'description',
      content:
        'View our gallery of expertly restored watches. See examples of our watch repair craftsmanship.',
    },
    {
      name: 'keywords',
      content:
        'watch repair, restored watches, timepieces, watch restoration, old watches, USSR watches, horology, craftsmanship',
    },
  ],
})

const postsStore = usePostsStore()

onMounted(async () => {
  await postsStore.initialize()
})
</script>

<template>
  <GalleryEl />
</template>
