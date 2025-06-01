<script setup>
import { FolderOpenIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import placeHolder from '../icons/placeHolder.vue'
// Historic posts filled from DB
const allPosts = ref([])
const gallery = ref('')

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
</script>
<template>
  <!-- GALLERY SECTION -->
  <section class="mx-auto max-w-7xl px-2">
    <div class="border border-amber-300">
      <button @click="getAllPosts" class="btn">get all</button>
      <p>{{ gallery }}</p>
    </div>
    <!-- Gallery Header -->
    <div class="mb-12 text-center">
      <div
        class="inline-flex items-center space-x-3 rounded-2xl border border-white/20 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80"
      >
        <FolderOpenIcon class="size-6 text-acc"></FolderOpenIcon>
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
        class="group cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700/50 dark:bg-sec/80"
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
              class="text-fg inline-flex items-center rounded-full border border-white/20 bg-white/90 px-2 py-1 text-xs font-medium dark:bg-sec group-hover:text-acc"
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
            v-if="post.extraImages && post.extraImages.length > 0"
            class="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700"
          >
            <div class="flex items-center justify-between">
              <span class="text-fg/60 text-xs">Additional photos</span>
              <div class="flex -space-x-2">
                <div
                  v-for="(img, idx) in post.extraImages.slice(0, 3)"
                  :key="idx"
                  class="h-6 w-6 overflow-hidden rounded-full border-2 border-white dark:border-slate-800"
                >
                  <img :src="`public/${img}`" class="h-full w-full object-cover" />
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
          class="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 via-transparent to-transparent pb-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <div class="flex space-x-3">
            <button
              type="button"
              class="rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                ></path>
              </svg>
            </button>
            <button
              class="rounded-lg bg-white/20 px-4 py-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
