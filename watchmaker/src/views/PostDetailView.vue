<script setup>
import { computed, ref, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute } from 'vue-router'
import {
  ArrowLongLeftIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ShareIcon,
} from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'
import ShareModal from '@/components/Gallery/ShareModal.vue'
import TheDivider from '@/components/TheDivider.vue'
import { usePostsStore } from '@/stores/usePostsStore'

const route = useRoute()
const postsStore = usePostsStore()

const { showShareModal, postToShare } = storeToRefs(postsStore)
const { fetchPostById, openShareModal, closeShareModal } = postsStore

const post = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const currentImageIndex = ref(0)

const allImages = computed(() => {
  if (!post.value) return []

  const images = []

  if (post.value.titleImage?.titlePath) {
    images.push(`/public${post.value.titleImage.titlePath}`)
  }

  if (post.value.extraImages?.length) {
    post.value.extraImages.forEach((image) => {
      images.push(`/public${image.path}`)
    })
  }

  return images
})

const pageImage = computed(() => {
  if (allImages.value.length > 0) {
    return allImages.value[0]
  }

  return '/assets/pictures/hoz-pocket-watch.webp'
})

useHead(
  computed(() => {
    const currentPost = post.value
    const title = currentPost?.postTitle
      ? `${currentPost.postTitle} | Workshop Gallery`
      : 'Workshop Gallery | The Watchmaker'
    const description =
      currentPost?.postBody || 'Beautiful craftsmanship and restoration work from the workshop.'
    const url =
      typeof window !== 'undefined' && currentPost?.postId
        ? `${window.location.origin}/my-work/${currentPost.postId}`
        : ''
    const image =
      typeof window !== 'undefined'
        ? `${window.location.origin}${pageImage.value}`
        : pageImage.value

    return {
      title,
      meta: [
        {
          name: 'description',
          content: description,
        },
        {
          property: 'og:title',
          content: title,
        },
        {
          property: 'og:description',
          content: description,
        },
        {
          property: 'og:image',
          content: image,
        },
        {
          property: 'og:url',
          content: url,
        },
        {
          name: 'twitter:title',
          content: title,
        },
        {
          name: 'twitter:description',
          content: description,
        },
        {
          name: 'twitter:image',
          content: image,
        },
      ],
    }
  }),
)

const loadPost = async (postId) => {
  if (!postId) {
    post.value = null
    loadError.value = 'This post could not be found.'
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    post.value = await fetchPostById(postId)
    currentImageIndex.value = 0
  } catch (error) {
    post.value = null
    loadError.value =
      error?.message === 'POST_NOT_FOUND'
        ? 'This post could not be found.'
        : 'This post could not be loaded right now.'
  } finally {
    isLoading.value = false
  }
}

const nextImage = () => {
  if (currentImageIndex.value < allImages.value.length - 1) {
    currentImageIndex.value += 1
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value -= 1
  }
}

const selectImage = (index) => {
  currentImageIndex.value = index
}

const sharePost = () => {
  if (post.value) {
    openShareModal(post.value)
  }
}

watch(
  () => route.params.postId,
  (postId) => {
    loadPost(postId)
  },
  { immediate: true },
)
</script>

<template>
  <section class="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
    <RouterLink
      to="/my-work"
      class="text-fg/70 hover:text-acc inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase transition-colors"
    >
      <ArrowLongLeftIcon class="size-4" />
      Back To Workshop Gallery
    </RouterLink>

    <div v-if="isLoading" class="mt-8 space-y-8">
      <div class="space-y-4">
        <div class="h-4 w-40 rounded-lg bg-fg/10 dark:bg-white/10"></div>
        <div class="h-12 w-3/4 rounded-lg bg-fg/10 dark:bg-white/10"></div>
        <div class="h-px w-32 bg-fg/10 dark:bg-white/10"></div>
      </div>

      <div
        class="bg-primary dark:bg-sec/80 border-acc/20 overflow-hidden rounded-lg border shadow-xl"
      >
        <div class="aspect-[16/10] animate-pulse bg-fg/8 dark:bg-white/6"></div>
        <div class="space-y-4 p-6">
          <div class="h-4 w-full rounded-lg bg-fg/10 dark:bg-white/10"></div>
          <div class="h-4 w-11/12 rounded-lg bg-fg/10 dark:bg-white/10"></div>
          <div class="h-4 w-2/3 rounded-lg bg-fg/10 dark:bg-white/10"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="loadError || !post"
      class="bg-primary dark:bg-sec/80 border-brdr dark:border-sec-mute mt-8 rounded-lg border p-8 text-center shadow-lg"
    >
      <h1 class="font-sec text-fg text-2xl">Post unavailable</h1>
      <p class="text-fg/70 mx-auto mt-3 max-w-2xl leading-relaxed">
        {{ loadError || 'This post could not be loaded.' }}
      </p>
      <RouterLink
        to="/my-work"
        class="bg-acc hover:bg-acc/90 mt-6 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        Return to gallery
      </RouterLink>
    </div>

    <article v-else class="mt-8 space-y-8">
      <header class="space-y-5">
        <div class="space-y-3">
          <p class="text-acc text-sm tracking-[0.25em] uppercase">Workshop Journal</p>
          <h1 class="font-sec text-fg text-4xl leading-tight md:text-5xl">
            {{ post.postTitle || 'Untitled Post' }}
          </h1>
          <TheDivider />
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-fg/70 inline-flex items-center gap-2 text-sm uppercase tracking-[0.15em]">
            <CalendarIcon class="size-4" />
            {{ post.date }}
          </div>

          <button
            type="button"
            class="border-brdr dark:border-sec-mute text-fg hover:text-acc hover:border-acc inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors"
            @click="sharePost"
          >
            <ShareIcon class="size-4" />
            Share Post
          </button>
        </div>
      </header>

      <div
        class="bg-primary dark:bg-sec/80 border-brdr dark:border-sec-mute overflow-hidden rounded-lg border shadow-xl"
      >
        <div class="relative aspect-[16/10] bg-black/5">
          <img
            v-if="allImages[currentImageIndex]"
            :src="allImages[currentImageIndex]"
            :alt="`${post.postTitle || 'Workshop post'} image ${currentImageIndex + 1}`"
            class="h-full w-full object-contain"
          />
          <div v-else class="flex h-full items-center justify-center">
            <PhotoIcon class="text-fg/30 size-16" />
          </div>

          <div
            v-if="allImages.length > 1"
            class="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-5"
          >
            <button
              type="button"
              class="pointer-events-auto flex size-10 items-center justify-center rounded-lg bg-black/55 text-white transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentImageIndex === 0"
              @click="previousImage"
            >
              <ChevronLeftIcon class="size-5" />
            </button>

            <button
              type="button"
              class="pointer-events-auto flex size-10 items-center justify-center rounded-lg bg-black/55 text-white transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="currentImageIndex === allImages.length - 1"
              @click="nextImage"
            >
              <ChevronRightIcon class="size-5" />
            </button>
          </div>

          <div
            v-if="allImages.length > 1"
            class="absolute right-4 bottom-4 rounded-lg bg-black/60 px-3 py-1 text-xs text-white"
          >
            {{ currentImageIndex + 1 }} / {{ allImages.length }}
          </div>
        </div>

        <div
          v-if="allImages.length > 1"
          class="border-brdr dark:border-sec-mute flex gap-3 overflow-x-auto border-t p-4"
        >
          <button
            v-for="(image, index) in allImages"
            :key="image"
            type="button"
            class="border-brdr dark:border-sec-mute hover:border-acc size-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:size-24"
            :class="currentImageIndex === index ? 'border-acc shadow-lg' : ''"
            @click="selectImage(index)"
          >
            <img
              :src="image"
              :alt="`Thumbnail ${index + 1}`"
              class="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

      <div
        class="bg-primary/90 dark:bg-sec/80 border-brdr dark:border-sec-mute rounded-lg border p-6 shadow-lg sm:p-8"
      >
        <div class="text-fg/85 space-y-5 whitespace-pre-line leading-relaxed">
          {{ post.postBody || 'This post does not have written content yet.' }}
        </div>
      </div>
    </article>

    <ShareModal :show="showShareModal" :post="postToShare || {}" @close="closeShareModal" />
  </section>
</template>
