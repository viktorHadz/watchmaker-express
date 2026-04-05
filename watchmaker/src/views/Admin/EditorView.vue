<script setup>
import { computed, ref, watch } from 'vue'
import { useHead } from '@vueuse/head'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import AdminNewPost from '@/components/Gallery/AdminNewPost.vue'
import TheDivider from '@/components/TheDivider.vue'
import { usePostsStore } from '@/stores/usePostsStore'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const { editForm } = storeToRefs(postsStore)
const { fetchPostById, prepareEdit, saveEdit, deletePost, cancelEdit } = postsStore

const post = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const loadError = ref('')

const isEditMode = computed(() => Boolean(route.params.postId))

useHead(
  computed(() => ({
    title: isEditMode.value ? 'Edit Post | The Watchmaker' : 'Create Post | The Watchmaker',
    meta: [
      {
        name: 'description',
        content: isEditMode.value
          ? 'Update an existing workshop post from the admin editor.'
          : 'Create a new workshop post from the dedicated admin editor.',
      },
    ],
  })),
)

const loadPost = async (postId) => {
  if (!postId) {
    post.value = null
    loadError.value = ''
    cancelEdit()
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetchPostById(postId)
    post.value = response
    prepareEdit(response)
  } catch (error) {
    post.value = null
    loadError.value =
      error?.message === 'POST_NOT_FOUND'
        ? 'This post no longer exists.'
        : 'The editor could not load this post.'
  } finally {
    isLoading.value = false
  }
}

const savePostChanges = async () => {
  if (!post.value) return

  isSaving.value = true

  const result = await saveEdit(post.value.postId)

  if (result?.success) {
    post.value = {
      ...post.value,
      postTitle: editForm.value.postTitle,
      postBody: editForm.value.postBody,
    }
  }

  isSaving.value = false
}

const removePost = async () => {
  if (!post.value) return

  const confirmed = window.confirm('Delete this post? This action cannot be undone.')

  if (!confirmed) return

  isDeleting.value = true
  const deleted = await deletePost(post.value.postId)
  isDeleting.value = false

  if (deleted) {
    cancelEdit()
    router.push('/my-work')
  }
}

const openCreateView = () => {
  cancelEdit()
  router.push('/admin/editor')
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
  <section class="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-4">
        <p class="text-acc text-sm tracking-[0.3em] uppercase">Admin Editor</p>
        <div>
          <h1 class="font-sec text-fg text-3xl font-light tracking-[0.2em] uppercase md:text-5xl">
            {{ isEditMode ? 'Edit Workshop Post' : 'Create Workshop Post' }}
          </h1>
          <TheDivider />
        </div>
        <p class="text-fg/75 max-w-3xl leading-relaxed">
          {{ isEditMode
            ? 'This is now a dedicated editing route instead of a gallery popover. It is the right place to refine title, copy, and media for a post.'
            : 'Post creation now lives in its own admin route so the authoring workflow is separate from the public gallery.' }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <RouterLink
          v-if="isEditMode && post"
          :to="`/my-work/${post.postId}`"
          class="border-brdr dark:border-sec-mute text-fg hover:text-acc hover:border-acc inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors"
        >
          <ArrowTopRightOnSquareIcon class="size-4" />
          View Public Page
        </RouterLink>

        <button
          type="button"
          class="bg-acc hover:bg-acc/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors"
          @click="openCreateView"
        >
          <PlusIcon class="size-4" />
          New Post
        </button>
      </div>
    </div>

    <div
      class="bg-acc/10 text-fg/80 border-acc/20 mb-8 rounded-lg border px-5 py-4 text-sm leading-relaxed"
    >
      Recommended next step: replace the plain body textarea with a proper editor library here,
      then render stored rich content on the public post page.
    </div>

    <AdminNewPost v-if="!isEditMode" embedded />

    <div v-else-if="isLoading" class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="bg-primary dark:bg-sec/80 rounded-lg border border-white/10 shadow-xl">
        <div class="aspect-[4/3] animate-pulse rounded-t-lg bg-fg/8 dark:bg-white/6"></div>
        <div class="space-y-3 p-6">
          <div class="h-5 w-40 rounded-lg bg-fg/10 dark:bg-white/10"></div>
          <div class="h-4 w-full rounded-lg bg-fg/10 dark:bg-white/10"></div>
          <div class="h-4 w-3/4 rounded-lg bg-fg/10 dark:bg-white/10"></div>
        </div>
      </div>

      <div class="bg-primary dark:bg-sec/80 rounded-lg border border-white/10 p-6 shadow-xl">
        <div class="space-y-4">
          <div class="h-10 rounded-lg bg-fg/10 dark:bg-white/10"></div>
          <div class="h-48 rounded-lg bg-fg/10 dark:bg-white/10"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="loadError || !post"
      class="bg-primary dark:bg-sec/80 border-brdr dark:border-sec-mute rounded-lg border p-8 text-center shadow-lg"
    >
      <h2 class="font-sec text-fg text-2xl">Post unavailable</h2>
      <p class="text-fg/70 mx-auto mt-3 max-w-2xl leading-relaxed">
        {{ loadError || 'The requested post could not be loaded.' }}
      </p>
      <button
        type="button"
        class="bg-acc hover:bg-acc/90 mt-6 inline-flex rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
        @click="openCreateView"
      >
        Create a new post instead
      </button>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="space-y-6">
        <div
          class="bg-primary/90 dark:bg-sec/80 border-brdr dark:border-sec-mute overflow-hidden rounded-lg border shadow-xl"
        >
          <div class="aspect-[4/3] bg-black/5">
            <img
              v-if="post.titleImage?.titlePath"
              :src="`/public${post.titleImage.titlePath}`"
              :alt="post.postTitle || 'Featured image'"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center">
              <PencilSquareIcon class="text-fg/25 size-16" />
            </div>
          </div>

          <div class="space-y-4 p-6">
            <div class="flex items-center gap-2 text-sm uppercase tracking-[0.15em] text-fg/60">
              <CalendarIcon class="size-4" />
              {{ post.date }}
            </div>

            <div>
              <p class="text-fg/60 text-sm uppercase tracking-[0.15em]">Featured Image</p>
              <p class="text-fg/80 mt-2 leading-relaxed">
                Media remains part of the post editor, but the writing experience now lives on its
                own route instead of inside the public gallery.
              </p>
            </div>
          </div>
        </div>

        <div
          v-if="post.extraImages?.length"
          class="bg-primary/90 dark:bg-sec/80 border-brdr dark:border-sec-mute rounded-lg border p-6 shadow-xl"
        >
          <h2 class="font-sec text-fg text-xl">Attached Gallery</h2>
          <div class="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
            <div
              v-for="image in post.extraImages"
              :key="image.id"
              class="aspect-square overflow-hidden rounded-lg"
            >
              <img :src="`/public${image.path}`" alt="Post image" class="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-primary/90 dark:bg-sec/80 border-brdr dark:border-sec-mute rounded-lg border p-6 shadow-xl"
      >
        <div class="mb-6 flex items-center gap-3">
          <div class="bg-acc/15 flex size-10 items-center justify-center rounded-lg">
            <PencilSquareIcon class="text-acc size-5" />
          </div>
          <div>
            <h2 class="font-sec text-fg text-xl">Post Copy</h2>
            <p class="text-fg/60 text-sm">
              Transitional editor view. This is where a proper rich-text editor should live.
            </p>
          </div>
        </div>

        <div class="space-y-5">
          <div class="space-y-2">
            <label for="admin-edit-title" class="input-lbl">Post Title</label>
            <input
              id="admin-edit-title"
              v-model="editForm.postTitle"
              type="text"
              class="input"
              placeholder="Post title"
            />
          </div>

          <div class="space-y-2">
            <label for="admin-edit-body" class="input-lbl">Post Body</label>
            <textarea
              id="admin-edit-body"
              v-model="editForm.postBody"
              rows="16"
              class="input min-h-80 w-full resize-y rounded-lg"
              placeholder="Write the story behind the piece, the work completed, and what makes it special."
            ></textarea>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            class="bg-acc hover:bg-acc/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
            @click="savePostChanges"
          >
            <CheckBadgeIcon class="size-4" />
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>

          <button
            type="button"
            class="border-danger/40 text-danger hover:bg-danger/10 inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium uppercase tracking-[0.15em] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeleting"
            @click="removePost"
          >
            <TrashIcon class="size-4" />
            {{ isDeleting ? 'Deleting...' : 'Delete Post' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
