<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLongLeftIcon,
  Bars3BottomLeftIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PhotoIcon,
  ShareIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'
import ShareModal from '@/components/Gallery/ShareModal.vue'
import TheDivider from '@/components/TheDivider.vue'
import QuickLinksGrid from '@/components/seo/QuickLinksGrid.vue'
import PostRichContent from '@/components/posts/PostRichContent.vue'
import { getServicePageLinks } from '@/seo/content'
import { buildPostHead } from '@/seo/head'
import { siteProfile } from '@/seo/siteProfile'
import { buildCanonicalPostPath, formatDisplayDate } from '@/seo/utils'
import { usePostsStore } from '@/stores/usePostsStore'
import { getPostExcerpt, getPostHeadings } from '@/utils/postContent'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const { showShareModal, postToShare } = storeToRefs(postsStore)
const { fetchPostById, openShareModal, closeShareModal } = postsStore

const post = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const lightboxIndex = ref(-1)
const lightboxZoom = ref(1)
const contentsOpen = ref(false)
const relatedServiceLinks = getServicePageLinks()

const titleImageUrl = computed(() => {
  if (!post.value?.titleImage?.titlePath) {
    return ''
  }

  return `/public${post.value.titleImage.titlePath}`
})

const extractImagesFromHtml = (html = '', postTitle = '') => {
  if (!html.trim()) {
    return []
  }

  if (typeof document === 'undefined') {
    return Array.from(
      html.matchAll(
        /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']|<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
      ),
    )
      .map((match, index) => ({
        id: `post-body-${index}`,
        src: match[1] || match[3] || '',
        alt:
          match[2] || (postTitle ? `${postTitle} image ${index + 1}` : `Post image ${index + 1}`),
      }))
      .filter((image) => image.src)
  }

  const container = document.createElement('div')
  container.innerHTML = html

  return Array.from(container.querySelectorAll('img'))
    .map((image, index) => ({
      id: `post-body-${index}`,
      src: image.getAttribute('src') || '',
      alt:
        image.getAttribute('alt') ||
        (postTitle ? `${postTitle} image ${index + 1}` : `Post image ${index + 1}`),
    }))
    .filter((image) => image.src)
}

const inlineImageSources = computed(() => {
  const body = post.value?.postBody || ''
  const matches = body.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)
  return new Set(Array.from(matches, ([, src]) => src))
})

const legacyGalleryImages = computed(() => {
  if (!post.value?.extraImages?.length) {
    return []
  }

  return post.value.extraImages
    .filter((image) => !inlineImageSources.value.has(`/public${image.path}`))
    .map((image, index) => ({
      id: image.id,
      src: `/public${image.path}`,
      alt: post.value?.postTitle
        ? `${post.value.postTitle} attached image ${index + 1}`
        : `Attached image ${index + 1}`,
    }))
})

const postBodyImages = computed(() =>
  extractImagesFromHtml(post.value?.postBody || '', post.value?.postTitle || ''),
)

const lightboxImages = computed(() => {
  const seen = new Set()
  const images = []

  const pushImage = (image) => {
    if (!image?.src || seen.has(image.src)) {
      return
    }

    seen.add(image.src)
    images.push(image)
  }

  if (titleImageUrl.value) {
    pushImage({
      id: 'featured-image',
      src: titleImageUrl.value,
      alt: post.value?.postTitle || 'Featured image',
    })
  }

  postBodyImages.value.forEach(pushImage)
  legacyGalleryImages.value.forEach(pushImage)

  return images
})

const activeLightboxImage = computed(() => {
  if (lightboxIndex.value < 0) {
    return null
  }

  return lightboxImages.value[lightboxIndex.value] || null
})

const contentHeadings = computed(() => getPostHeadings(post.value?.postBody || ''))
const displayDate = computed(() => {
  const formatted = formatDisplayDate(post.value?.publishedAt || post.value?.updatedAt || '')
  return formatted || post.value?.date || ''
})

const shareLinks = computed(() => {
  if (!post.value?.postId) {
    return []
  }

  const canonicalUrl = `${siteProfile.siteOrigin}${buildCanonicalPostPath(post.value)}`
  const shareTitle = post.value.postTitle || 'Recent work from The Watchmaker'
  const shareDescription =
    getPostExcerpt(post.value.postBody, 100) || 'Recent repair work from the workshop.'

  return [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}&quote=${encodeURIComponent(shareTitle)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(`${shareTitle} #WatchRepair #VintageWatches #TheWatchmaker`)}`,
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`Take a look at this recent repair from The Watchmaker: "${shareTitle}" ${canonicalUrl}`)}`,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(`The Watchmaker: ${shareTitle}`)}&body=${encodeURIComponent(`Hi!\n\nI wanted to share this recent repair story with you:\n\n"${shareTitle}"\n\n${shareDescription}\n\nTake a look here:\n\n${canonicalUrl}`)}`,
    },
  ]
})

const clampLightboxZoom = (value) => Math.min(4, Math.max(1, Math.round(value * 100) / 100))

const resetLightboxZoom = () => {
  lightboxZoom.value = 1
}

const closeLightbox = () => {
  lightboxIndex.value = -1
  resetLightboxZoom()
}

const openLightbox = (index) => {
  if (index < 0 || index >= lightboxImages.value.length) {
    return
  }

  lightboxIndex.value = index
  resetLightboxZoom()
}

const openLightboxBySrc = (src = '') => {
  const targetIndex = lightboxImages.value.findIndex((image) => image.src === src)
  if (targetIndex !== -1) {
    openLightbox(targetIndex)
  }
}

const showPreviousImage = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value -= 1
    resetLightboxZoom()
  }
}

const showNextImage = () => {
  if (lightboxIndex.value < lightboxImages.value.length - 1) {
    lightboxIndex.value += 1
    resetLightboxZoom()
  }
}

const adjustLightboxZoom = (delta) => {
  lightboxZoom.value = clampLightboxZoom(lightboxZoom.value + delta)
}

const toggleLightboxZoom = () => {
  lightboxZoom.value = lightboxZoom.value > 1 ? 1 : 2
}

const handleLightboxKeydown = (event) => {
  if (!activeLightboxImage.value) {
    return
  }

  if (event.key === 'Escape') {
    closeLightbox()
  } else if (event.key === 'ArrowLeft') {
    showPreviousImage()
  } else if (event.key === 'ArrowRight') {
    showNextImage()
  } else if (event.key === '+' || event.key === '=') {
    adjustLightboxZoom(0.25)
  } else if (event.key === '-' || event.key === '_') {
    adjustLightboxZoom(-0.25)
  } else if (event.key === '0') {
    resetLightboxZoom()
  }
}

const handleLightboxWheel = (event) => {
  if (!activeLightboxImage.value) {
    return
  }

  adjustLightboxZoom(event.deltaY < 0 ? 0.2 : -0.2)
}

const handleBodyImageClick = (event) => {
  const target = event.target
  if (!(target instanceof HTMLElement)) {
    return
  }

  const image = target.closest('img')
  const src = image?.getAttribute('src') || ''

  if (src) {
    openLightboxBySrc(src)
  }
}

watch(
  () => activeLightboxImage.value,
  (image) => {
    if (image) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleLightboxKeydown)
      return
    }

    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleLightboxKeydown)
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleLightboxKeydown)
})

useHead(
  computed(() => {
    const currentPost = post.value
    if (!currentPost) {
      return {
        title: 'Workshop Story | The Watchmaker',
        meta: [
          {
            name: 'description',
            content:
              'Workshop stories covering vintage and mechanical watch repair, servicing, and restoration.',
          },
        ],
      }
    }

    return buildPostHead(currentPost)
  }),
)

const loadPost = async (postId) => {
  if (!postId) {
    post.value = null
    loadError.value = 'This post could not be found.'
    isLoading.value = false
    closeLightbox()
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const loadedPost = await fetchPostById(postId)
    post.value = loadedPost
    contentsOpen.value = false
    closeLightbox()

    const canonicalPath = buildCanonicalPostPath(loadedPost)
    if (route.fullPath !== canonicalPath) {
      await router.replace(canonicalPath)
    }
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

const sharePost = () => {
  if (post.value) {
    openShareModal(post.value)
  }
}

const scrollToHeading = (headingId) => {
  if (typeof document === 'undefined' || !headingId) {
    return
  }

  const target = document.getElementById(headingId)
  if (!target) {
    return
  }

  contentsOpen.value = false
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const getTocIndentClass = (level) => {
  switch (level) {
    case 2:
      return 'pl-3'
    case 3:
      return 'pl-6'
    case 4:
      return 'pl-8'
    default:
      return ''
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
  <section class="relative mx-auto my-4 max-w-7xl px-4 py-12 sm:my-22 sm:px-6 lg:px-8">
    <RouterLink
      to="/my-work"
      class="text-fg/80 hover:text-acc inline-flex items-center gap-2 text-sm tracking-[0.2em] uppercase transition-colors"
    >
      <ArrowLongLeftIcon class="size-4" />
      Back To Workshop Gallery
    </RouterLink>

    <div v-if="isLoading" class="mt-8 space-y-8">
      <div class="space-y-4">
        <div class="bg-fg/10 h-4 w-40 rounded-lg dark:bg-white/10"></div>
        <div class="bg-fg/10 h-12 w-3/4 rounded-lg dark:bg-white/10"></div>
        <div class="bg-fg/10 h-px w-32 dark:bg-white/10"></div>
      </div>

      <div
        class="bg-primary dark:bg-sec/80 border-acc/20 overflow-hidden rounded-lg border shadow-xl"
      >
        <div class="bg-fg/8 aspect-[16/10] animate-pulse dark:bg-white/6"></div>
        <div class="space-y-4 p-6">
          <div class="bg-fg/10 h-4 w-full rounded-lg dark:bg-white/10"></div>
          <div class="bg-fg/10 h-4 w-11/12 rounded-lg dark:bg-white/10"></div>
          <div class="bg-fg/10 h-4 w-2/3 rounded-lg dark:bg-white/10"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="loadError || !post"
      class="bg-primary dark:bg-sec/80 border-brdr dark:border-sec-mute mt-8 rounded-lg border p-8 text-center shadow-lg"
    >
      <h1 class="font-sec text-fg text-2xl">Post unavailable</h1>
      <p class="text-fg/80 mx-auto mt-3 max-w-2xl leading-relaxed">
        {{ loadError || 'This post could not be loaded.' }}
      </p>
      <RouterLink
        to="/my-work"
        class="bg-acc hover:bg-acc/90 mt-6 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        Return to gallery
      </RouterLink>
    </div>

    <article v-else class="mt-8 rounded-lg lg:px-8 lg:py-10 dark:px-4 dark:py-6">
      <div
        class="mx-auto grid max-w-6xl gap-10"
        :class="contentHeadings.length ? 'lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12' : ''"
      >
        <div class="min-w-0 space-y-10">
          <div class="mx-auto max-w-5xl overflow-hidden rounded-lg">
            <button
              v-if="titleImageUrl"
              type="button"
              class="block w-full cursor-zoom-in"
              @click="openLightboxBySrc(titleImageUrl)"
            >
              <img
                :src="titleImageUrl"
                :alt="post.postTitle || 'Featured image'"
                class="aspect-[16/9] h-full w-full object-cover"
              />
            </button>
            <div v-else class="bg-fg/5 flex aspect-[16/9] items-center justify-center rounded-lg">
              <PhotoIcon class="text-fg/30 size-16" />
            </div>
          </div>

          <header class="mx-auto max-w-3xl space-y-5">
            <div class="space-y-3">
              <p class="text-acc text-sm tracking-[0.25em] uppercase">Workshop Journal</p>
              <h1 class="font-sec text-fg dark:text-fg/98 text-4xl leading-tight md:text-5xl">
                {{ post.postTitle || 'Untitled Story' }}
              </h1>
              <TheDivider />
            </div>

            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                class="text-fg/80 dark:text-fg/82 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase"
              >
                <CalendarIcon class="size-4" />
                {{ displayDate }}
              </div>

              <button
                type="button"
                class="border-brdr text-fg hover:text-acc hover:border-acc inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm tracking-[0.15em] uppercase transition-colors"
                @click="sharePost"
              >
                <ShareIcon class="size-4" />
                Share Story
              </button>
            </div>
          </header>

          <section v-if="contentHeadings.length" class="mx-auto max-w-3xl lg:hidden">
            <button
              type="button"
              class="border-brdr bg-sec-light/50 dark:bg-sec/70 text-fg/90 dark:text-fg/94 hover:border-acc inline-flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
              @click="contentsOpen = !contentsOpen"
            >
              <span class="inline-flex items-center gap-2">
                <Bars3BottomLeftIcon class="size-5" />
                Contents
              </span>
              <span class="text-fg/80 dark:text-fg/72 text-xs tracking-[0.15em] uppercase">
                {{ contentsOpen ? 'Hide' : 'Show' }}
              </span>
            </button>

            <div
              v-if="contentsOpen"
              class="border-brdr dark:border-sec-mute bg-sec-light/55 dark:bg-sec/78 mt-3 rounded-lg border p-4"
            >
              <nav aria-label="Post contents">
                <ul class="space-y-2">
                  <li v-for="heading in contentHeadings" :key="heading.id">
                    <button
                      type="button"
                      class="text-fg/80 hover:text-acc dark:text-fg/86 flex w-full text-left text-sm leading-relaxed transition-colors"
                      :class="getTocIndentClass(heading.level)"
                      @click="scrollToHeading(heading.id)"
                    >
                      {{ heading.text }}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </section>

          <div class="mx-auto max-w-3xl" @click="handleBodyImageClick">
            <PostRichContent
              :content="post.postBody"
              empty-message="This post does not have written content yet."
            />
          </div>

          <section v-if="legacyGalleryImages.length" class="mx-auto w-full max-w-3xl space-y-5">
            <div class="space-y-2">
              <p class="text-acc text-sm tracking-[0.2em] uppercase">Attached Images</p>
              <p class="text-fg/80 dark:text-fg/78 leading-relaxed">
                This post has additional attached images outside the main story body.
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                v-for="(image, index) in legacyGalleryImages"
                :key="image.id"
                type="button"
                class="border-brdr dark:border-sec-mute/80 bg-sec-light/50 dark:bg-sec/72 group overflow-hidden rounded-lg border text-left transition-transform hover:-translate-y-1"
                @click="openLightboxBySrc(image.src)"
              >
                <div class="overflow-hidden">
                  <img
                    :src="image.src"
                    :alt="image.alt"
                    class="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div class="px-4 py-3">
                  <p class="text-fg/92 dark:text-fg/96 font-medium">
                    Attached image {{ index + 1 }}
                  </p>
                  <p class="text-fg/80 dark:text-fg/72 text-sm">Click to enlarge</p>
                </div>
              </button>
            </div>
          </section>

          <section
            class="mx-auto w-full max-w-3xl rounded-lg border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55"
          >
            <p class="text-acc text-sm tracking-[0.2em] uppercase">Need Similar Work?</p>
            <h2 class="font-sec text-fg mt-3 text-2xl font-light tracking-[0.08em] uppercase">
              Start With An Estimate
            </h2>
            <p class="text-fg/80 mt-4 leading-relaxed">
              If you have a similar watch, send photos and a short description through the repairs
              page. Vintage and mechanical work is welcome, and postal repair can be arranged for
              clients outside London too.
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <RouterLink
                to="/repairs"
                class="bg-acc hover:bg-acc/90 rounded-lg px-5 py-3 text-sm font-medium tracking-[0.16em] text-white uppercase transition-colors"
              >
                Start Repair Enquiry
              </RouterLink>
              <RouterLink
                to="/my-work"
                class="border-brdr text-fg hover:border-acc hover:text-acc rounded-lg border px-5 py-3 text-sm font-medium tracking-[0.16em] uppercase transition-colors"
              >
                Back To Gallery
              </RouterLink>
            </div>
          </section>

          <section
            v-if="shareLinks.length"
            class="mx-auto w-full max-w-3xl rounded-lg border border-slate-200/70 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/55"
          >
            <p class="text-acc text-sm tracking-[0.2em] uppercase">Share This Repair Story</p>
            <p class="text-fg/80 mt-4 leading-relaxed">
              If this piece is useful, you can send it directly to someone else.
            </p>
            <div class="mt-5 flex flex-wrap gap-3">
              <a
                v-for="link in shareLinks"
                :key="link.label"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="border-brdr text-fg hover:border-acc hover:text-acc rounded-lg border px-4 py-2 text-sm font-medium tracking-[0.14em] uppercase transition-colors"
              >
                {{ link.label }}
              </a>
            </div>
          </section>
        </div>

        <aside v-if="contentHeadings.length" class="hidden lg:block">
          <div class="sticky top-28 space-y-4">
            <div
              class="border-brdr dark:border-sec-mute bg-sec-light/55 dark:bg-sec/76 rounded-lg border p-4"
            >
              <p class="text-acc text-xs tracking-[0.24em] uppercase">On This Page</p>
              <nav class="mt-4" aria-label="Post contents">
                <ul class="space-y-2.5">
                  <li v-for="heading in contentHeadings" :key="heading.id">
                    <button
                      type="button"
                      class="text-fg/80 hover:text-acc dark:text-fg/86 flex w-full text-left text-sm leading-relaxed transition-colors"
                      :class="getTocIndentClass(heading.level)"
                      @click="scrollToHeading(heading.id)"
                    >
                      {{ heading.text }}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </article>

    <Teleport to="body">
      <div
        v-if="activeLightboxImage"
        class="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
        @click.self="closeLightbox"
      >
        <div class="absolute top-5 left-5 flex items-center gap-2">
          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-40"
            :disabled="lightboxZoom <= 1"
            @click="adjustLightboxZoom(-0.25)"
          >
            <MagnifyingGlassMinusIcon class="size-5" />
          </button>

          <div
            class="min-w-16 rounded-full bg-white/10 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur-sm"
          >
            {{ Math.round(lightboxZoom * 100) }}%
          </div>

          <button
            type="button"
            class="flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-40"
            :disabled="lightboxZoom >= 4"
            @click="adjustLightboxZoom(0.25)"
          >
            <MagnifyingGlassPlusIcon class="size-5" />
          </button>
        </div>

        <button
          type="button"
          class="absolute top-5 right-5 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          @click="closeLightbox"
        >
          <XMarkIcon class="size-6" />
        </button>

        <button
          v-if="lightboxImages.length > 1"
          type="button"
          class="absolute left-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-40"
          :disabled="lightboxIndex === 0"
          @click="showPreviousImage"
        >
          <ChevronLeftIcon class="size-6" />
        </button>

        <div
          class="max-h-[90vh] max-w-6xl overflow-auto rounded-lg"
          @wheel.prevent="handleLightboxWheel"
        >
          <img
            :src="activeLightboxImage.src"
            :alt="activeLightboxImage.alt"
            class="mx-auto block cursor-zoom-in object-contain transition-[width] duration-200"
            :style="{
              width: `${lightboxZoom * 100}%`,
              maxWidth: lightboxZoom > 1 ? 'none' : '100%',
            }"
            @click.stop="toggleLightboxZoom"
          />
        </div>

        <button
          v-if="lightboxImages.length > 1"
          type="button"
          class="absolute right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-40"
          :disabled="lightboxIndex === lightboxImages.length - 1"
          @click="showNextImage"
        >
          <ChevronRightIcon class="size-6" />
        </button>
      </div>
    </Teleport>

    <QuickLinksGrid title="Related Services" :items="relatedServiceLinks" />

    <ShareModal :show="showShareModal" :post="postToShare || {}" @close="closeShareModal" />
  </section>
</template>
