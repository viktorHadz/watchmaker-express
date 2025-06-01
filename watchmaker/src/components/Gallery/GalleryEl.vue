<script setup>
import { EyeIcon, FolderOpenIcon, PhotoIcon, ShareIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import PostModal from './FullPost.vue'
// Historic posts filled from DB
const allPosts = ref([])

async function getAllPosts() {
  try {
    const response = await fetch('/api/posts/get-all')
    if (!response.ok) throw new Error(`Error getting posts: ${response.status}`)
    const posts = await response.json()
    console.log(posts)
    allPosts.value = posts
  } catch (error) {
    console.error('Error: ', error)
  }
}

const showPostModal = ref(false)
const selectedPost = ref({})

const openPost = (post) => {
  selectedPost.value = post
  showPostModal.value = true
}

const handlePostShare = (post) => {
  // Your custom share logic here
  console.log('Sharing post:', post)
}
</script>
<template>
  <!-- GALLERY SECTION -->
  <section class="mx-auto max-w-7xl px-2">
    <button @click="getAllPosts" class="btn">get all</button>
    <!-- Gallery Header -->
    <div class="mb-12 text-center">
      <div
        class="inline-flex items-center space-x-3 rounded-2xl border border-white/20 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80"
      >
        <FolderOpenIcon class="text-acc size-6"></FolderOpenIcon>
        <h2 class="font-sec text-fg text-2xl font-semibold">Workshop Gallery</h2>
      </div>
      <p class="text-fg/70 mx-auto mt-4 max-w-2xl">
        A showcase of precision craftsmanship and horological excellence
      </p>
    </div>

    <div v-if="allPosts.length === 0 || allPosts.posts?.length === 0" class="py-16 text-center">
      <div class="bg-acc/10 mx-auto mb-6 flex size-24 items-center justify-center rounded-2xl">
        <PhotoIcon class="text-acc size-12"></PhotoIcon>
      </div>
      <h3 class="font-sec text-fg mb-2 text-xl font-semibold">No posts yet</h3>
      <p class="text-fg/60">Create your first post to showcase your work</p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article
        v-for="(post, i) in allPosts.posts"
        :key="i"
        class="group dark:bg-sec/80 bg-primary border-acc/20 hover:border-acc/40 dark:hover:border-acc/40 cursor-pointer overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700/50"
        @click="openPost(post)"
      >
        <!-- Image -->
        <div class="relative aspect-[4/3] overflow-hidden">
          <img
            :src="`/public${post.titleImage.titlePath}` || '/assets/pictures/placeholder.webp'"
            :alt="post.title"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          ></div>

          <!-- Date Badge -->
          <div class="absolute top-3 right-3">
            <span
              class="text-fg dark:bg-sec group-hover:text-acc inline-flex items-center rounded-full border border-white/20 bg-white/90 px-2 py-1 text-xs font-medium"
            >
              {{ post.date }}
            </span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div v-if="post.extraImages?.length > 0" class="space-y-3">
            <h3
              class="font-sec text-fg group-hover:text-acc line-clamp-2 text-lg font-semibold transition-colors"
            >
              {{ post.postTitle }}
            </h3>
            <p class="text-fg/70 line-clamp-3 text-sm leading-relaxed">
              {{ post.postBody }}
            </p>
          </div>
          <div v-else class="flex items-center justify-center py-4">
            <div>
              <h3
                class="font-sec text-fg group-hover:text-acc line-clamp-2 text-lg font-semibold transition-colors"
              >
                {{ post.postTitle }}
              </h3>
              <p class="text-fg/70 line-clamp-3 text-sm leading-relaxed">
                {{ post.postBody }}
              </p>
            </div>
          </div>

          <!-- Additional Images Indicator -->
          <div
            v-if="post.thumbImages && post.thumbImages.length > 0"
            class="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700"
          >
            <div class="flex items-center justify-between">
              <span class="text-fg/60 text-xs">Additional photos</span>
              <div class="flex -space-x-2">
                <div
                  v-for="(img, idx) in post.thumbImages.slice(0, 3)"
                  :key="idx"
                  class="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-slate-800"
                >
                  <img :src="`/public${img.path}`" class="h-full w-full object-cover" />
                </div>
                <div
                  v-if="post.extraImages.length > 3"
                  class="bg-acc/20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-slate-800"
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
          class="dark:from-acc/5 from-acc/20 absolute inset-0 flex items-end justify-center bg-gradient-to-t via-transparent to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div class="flex space-x-3">
            <button
              type="button"
              class="bg-primary/40 hover:bg-primary/60 text-fg/60 hover:text-acc cursor-pointer rounded-lg px-4 py-2 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
            >
              <EyeIcon class="size-4"></EyeIcon>
            </button>
            <button
              class="bg-primary/40 hover:bg-primary/60 text-fg/60 hover:text-acc cursor-pointer rounded-lg px-4 py-2 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
            >
              <ShareIcon class="size-4"></ShareIcon>
            </button>
          </div>
        </div>
      </article>
    </div>
    <PostModal
      :show="showPostModal"
      :post="selectedPost"
      @close="showPostModal = false"
      @share="handlePostShare"
    />
  </section>
</template>
