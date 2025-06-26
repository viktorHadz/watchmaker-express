<script setup>
import { ShareIcon, TrashIcon, PencilSquareIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import { onMounted, useTemplateRef } from 'vue'
import PostModal from './FullPost.vue'
import ShareModal from './ShareModal.vue' // Import ShareModal
import IconGallery from '../icons/IconGallery.vue'
import PaginationMain from '../PaginationMain.vue'
import { useAuth } from '../../composables/useAuth.js'
import { usePostsStore } from '@/stores/usePostsStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const { isAuthenticated } = useAuth()
const postsRef = useTemplateRef('postsRef')

// Use the posts store
const postsStore = usePostsStore()
const router = useRouter()

// Get reactive state from store
const { allPosts, loading, pageNumbers, showPostModal, selectedPost, showShareModal, postToShare } =
  storeToRefs(postsStore)

// Get actions from store (these don't need storeToRefs)
const {
  openPost,
  closePostModal,
  openShareModal,
  closeShareModal,
  handlePageChange,
  deletePost,
  initialize,
  initEdit,
} = postsStore

// Handle page change with smooth scroll
const handlePageChangeWithScroll = async (page) => {
  await handlePageChange(page)
  if (postsRef.value) {
    postsRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

// Handle opening a post
const handleOpenPost = (post) => {
  openPost(post)
  router.push(`/my-work/${post.postId}`)
}

const handleClosePost = () => {
  closePostModal()
  router.push('/my-work')
}

// Handle share button click opens share modal
const handlePostShare = (post) => {
  console.log('Gallery: Opening share modal for post', post.postId)
  openShareModal(post) // Store handles opening share modal
}

// Handle closing share modal
const handleCloseShareModal = () => {
  console.log('Gallery: Closing share modal')
  closeShareModal() // Store handles closing
}

onMounted(() => {
  initialize()
})
</script>

<template>
  <!-- GALLERY SECTION -->
  <section class="mx-auto max-w-7xl px-2" ref="postsRef">
    <!-- Gallery Header -->
    <div class="py-12 text-center">
      <div class="mb-2 text-center">
        <h2 class="font-sec text-fg dark:text-fg mb-4 text-4xl font-medium lg:text-5xl">
          Workshop Gallery
        </h2>
        <div class="mb-6 flex items-center justify-center space-x-4">
          <div class="to-acc/50 h-px w-20 bg-gradient-to-r from-transparent"></div>
          <div class="flex space-x-1">
            <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
            <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
          </div>
          <div class="to-acc/50 h-px w-20 bg-gradient-to-l from-transparent"></div>
        </div>
        <p class="text-fg/70 mx-auto max-w-2xl text-lg leading-relaxed">
          A showcase of precision craftsmanship and horological excellence
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="flex items-center space-x-2">
        <div class="bg-acc size-3 animate-bounce rounded-full"></div>
        <div class="bg-acc animation-delay-200 size-3 animate-bounce rounded-full"></div>
        <div class="bg-acc animation-delay-400 size-3 animate-bounce rounded-full"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!allPosts.posts || allPosts.posts.length === 0" class="py-16 text-center">
      <div class="bg-acc/10 mx-auto mb-6 flex size-24 items-center justify-center rounded-2xl">
        <IconGallery class="text-acc size-12"></IconGallery>
      </div>
      <h3 class="font-sec text-fg mb-2 text-xl font-semibold">No posts yet</h3>
      <p class="text-fg/60">Create your first post to showcase your work</p>
    </div>

    <!-- Gallery Grid -->
    <div
      v-else
      class="grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 sm:gap-8 md:gap-10 lg:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="(post, i) in allPosts.posts"
        :key="post.postId || i"
        class="group dark:bg-sec/80 bg-primary border-acc/20 hover:border-acc/40 dark:hover:border-acc/40 dark:border-sec-mute/50 cursor-pointer overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
        @click="handleOpenPost(post)"
      >
        <!-- Image -->
        <div class="relative aspect-[4/3] overflow-hidden">
          <img
            :src="`/public${post.titleImage.titlePath}` || '/assets/pictures/placeholder.webp'"
            :alt="post.title"
            class="h-full w-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          ></div>

          <!-- Date Badge -->
          <div class="absolute top-3 right-3">
            <span
              class="text-fg dark:bg-sec group-hover:text-acc inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2 py-1 text-xs font-medium"
            >
              <CalendarIcon class="size-4" />
              {{ post.date }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-3 sm:p-6">
          <div v-if="post.extraImages?.length > 0" class="space-y-1 sm:space-y-3">
            <h3
              class="font-sec text-fg group-hover:text-acc line-clamp-2 text-lg font-semibold transition-colors"
            >
              {{ post.postTitle }}
            </h3>

            <p class="text-fg/70 line-clamp-1 text-sm leading-relaxed sm:line-clamp-2">
              {{ post.postBody }}
            </p>
          </div>
          <div v-else class="space-y-3">
            <h3
              class="font-sec text-fg group-hover:text-acc line-clamp-2 text-lg font-semibold transition-colors"
            >
              {{ post.postTitle }}
            </h3>

            <!-- Decorative divider -->
            <div class="flex items-center justify-center">
              <div
                class="via-acc/30 h-px w-12 bg-gradient-to-r from-transparent to-transparent"
              ></div>
              <div class="bg-acc/50 mx-2 h-1 w-1 rounded-full"></div>
              <div
                class="via-acc/30 h-px w-12 bg-gradient-to-l from-transparent to-transparent"
              ></div>
            </div>

            <p class="text-fg/70 line-clamp-3 text-sm leading-relaxed">
              {{ post.postBody }}
            </p>
          </div>

          <!-- Additional Images Indicator -->
          <div
            v-if="post.thumbImages && post.thumbImages.length > 0"
            class="border-brdr dark:border-sec-mute mt-3 border-t pt-2 sm:mt-4 sm:pt-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-fg/60 text-sm">Additional photos</span>
              <div class="flex -space-x-2">
                <div
                  v-for="(img, idx) in post.thumbImages.slice(0, 3)"
                  :key="idx"
                  class="border-brdr dark:border-sec size-7 overflow-hidden rounded-full border-2 sm:size-6"
                >
                  <img :src="`/public${img.path}`" class="h-full w-full object-cover" />
                </div>
                <div
                  v-if="post.extraImages.length > 3"
                  class="bg-acc/20 border-brdr dark:border-sec flex h-6 w-6 items-center justify-center rounded-full border-2"
                >
                  <span class="text-acc text-xs font-medium"
                    >+{{ post.extraImages.length - 3 }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hover Action Buttons -->
        <div
          v-if="isAuthenticated"
          class="absolute top-3 left-3 flex space-x-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
        >
          <button
            @click.stop="initEdit(post)"
            type="button"
            class="cursor-pointer rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-blue-600"
          >
            <PencilSquareIcon class="size-4"></PencilSquareIcon>
          </button>
          <button
            @click.stop="deletePost(post.postId)"
            class="cursor-pointer rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-red-600"
          >
            <TrashIcon class="size-4"></TrashIcon>
          </button>
        </div>

        <!-- Share Button (for non-authenticated users) -->
        <div
          v-else
          class="absolute top-3 left-3 space-x-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100"
        >
          <button
            @click.stop="handlePostShare(post)"
            class="cursor-pointer rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-white hover:text-blue-600"
          >
            <ShareIcon class="size-3.5 sm:size-4"></ShareIcon>
          </button>
        </div>
      </article>
    </div>

    <!-- Pagination -->
    <PaginationMain
      :page-numbers="pageNumbers"
      :pagination-data="allPosts.pagination"
      @page-change="handlePageChangeWithScroll"
    />

    <!-- Post Modal -->
    <PostModal
      :show="showPostModal"
      :post="selectedPost"
      @close="handleClosePost"
      @share="handlePostShare"
    />

    <!-- Share Modal -->
    <ShareModal :show="showShareModal" :post="postToShare || {}" @close="handleCloseShareModal" />
  </section>
</template>

<style scoped>
.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}
</style>
