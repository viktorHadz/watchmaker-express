<script setup>
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/usePostsStore'
import NewGalleryElement from '@/components/Gallery/AdminNewPost.vue'
import GalleryEl from '@/components/Gallery/GalleryEl.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated } = useAuth()
const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

// Update meta tags for social sharing
const updateMetaTags = (post) => {
  if (!post?.postId) return

  const postUrl = `${window.location.origin}/my-work/${post.postId}`
  const imageUrl = post.titleImage?.titlePath
    ? `${window.location.origin}/public${post.titleImage.titlePath}`
    : '/assets/pictures/hoz-pocket-watch.webp'

  const title = post.postTitle || 'Amazing Workshop Piece'
  const description = post.postBody || 'Beautiful craftsmanship from our workshop'

  // Update document title
  document.title = `${title} | Workshop Gallery`

  // Update existing meta tags
  document.querySelector('meta[property="og:title"]').content = title
  document.querySelector('meta[property="og:description"]').content = description
  document.querySelector('meta[property="og:image"]').content = imageUrl
  document.querySelector('meta[property="og:url"]').content = postUrl

  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title) ||
    document.head.insertAdjacentHTML('beforeend', `<meta name="twitter:title" content="${title}">`)

  document
    .querySelector('meta[name="twitter:description"]')
    ?.setAttribute('content', description) ||
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="twitter:description" content="${description}">`,
    )

  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', imageUrl) ||
    document.head.insertAdjacentHTML(
      'beforeend',
      `<meta name="twitter:image" content="${imageUrl}">`,
    )

  console.log('✅ Meta tags updated for:', title)
}

// Reset to default meta tags
const resetMetaTags = () => {
  document.title = 'Workshop Gallery - Ves'
  document.querySelector('meta[property="og:title"]').content = 'Workshop Gallery'
  document.querySelector('meta[property="og:description"]').content =
    'Precision craftsmanship showcase'
  document.querySelector('meta[property="og:image"]').content =
    '/assets/pictures/hoz-pocket-watch.webp'
  document.querySelector('meta[property="og:url"]').content = `${window.location.origin}/my-work`

  console.log('✅ Meta tags reset to default')
}

onMounted(async () => {
  console.log('MyWorkView mounted, route params:', route.params)

  await postsStore.initialize()
  console.log('Posts loaded:', postsStore.posts.length)

  if (route.params.postId) {
    const postId = route.params.postId
    console.log('Looking for post with ID:', postId)

    const post = postsStore.openPostById(postId)

    if (!post) {
      console.log('Post not found, redirecting to gallery')
      router.replace('/my-work')
    } else {
      console.log('Post found:', post.postTitle)
      updateMetaTags(post)
    }
  }
})

watch(
  () => route.params.postId,
  (postId) => {
    if (postId) {
      const post = postsStore.posts.find((p) => p.postId == postId)
      if (post) {
        console.log('Route changed, updating meta for:', post.postTitle)
        updateMetaTags(post)
      }
    } else {
      resetMetaTags()
    }
  },
)
</script>

<template>
  <div>
    <div v-if="isAuthenticated" class="relative mx-auto">
      <NewGalleryElement />
    </div>
    <GalleryEl />
  </div>
</template>
