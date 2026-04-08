<script setup>
import { computed, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import AdminNewPost from '@/components/Gallery/AdminNewPost.vue'
import PostBlockBuilder from '@/components/posts/PostBlockBuilder.vue'
import PostSeoFields from '@/components/posts/PostSeoFields.vue'
import { usePostsStore } from '@/stores/usePostsStore'
import {
  buildPostHtmlFromBlocks,
  getReferencedAssetIds,
  parsePostHtmlToBlocks,
} from '@/utils/postBlocks'
import { buildCanonicalPostPath } from '@/seo/utils'
import { siteProfile } from '@/seo/siteProfile'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const { fetchPostById, prepareEdit, saveEdit, deletePost, cancelEdit } = postsStore

const post = ref(null)
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const loadError = ref('')
const postTitle = ref('')
const postBlocks = ref([])
const postAssets = ref([])
const seoFields = ref({
  brand: '',
  model: '',
})

const isEditMode = computed(() => Boolean(route.params.postId))

const referencedAssetIds = computed(() => getReferencedAssetIds(postBlocks.value))
const referencedAssets = computed(() =>
  postAssets.value.filter((asset) => referencedAssetIds.value.has(`${asset.id}`)),
)
const postBodyHtml = computed(() =>
  buildPostHtmlFromBlocks(postBlocks.value, referencedAssets.value, {
    useTokens: true,
  }),
)

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

const featuredImageUrl = computed(() => {
  if (!post.value?.titleImage?.titlePath) {
    return ''
  }

  return `/public${post.value.titleImage.titlePath}`
})

const createPersistedAsset = (image, postTitleValue, index) => ({
  id: `${image.id}`,
  src: `/public${image.path}`,
  thumbnailSrc: `/public${image.path}`,
  label: `Attached image ${index + 1}`,
  alt: postTitleValue ? `${postTitleValue} image ${index + 1}` : `Attached image ${index + 1}`,
})

const loadPost = async (postId) => {
  if (!postId) {
    post.value = null
    postTitle.value = ''
    loadError.value = ''
    postBlocks.value = []
    postAssets.value = []
    seoFields.value = {
      brand: '',
      model: '',
    }
    cancelEdit()
    return
  }

  isLoading.value = true
  loadError.value = ''

  try {
    const response = await fetchPostById(postId)
    post.value = response
    postTitle.value = response.postTitle || ''

    const attachedAssets = (response.extraImages || []).map((image, index) =>
      createPersistedAsset(image, response.postTitle, index),
    )

    postAssets.value = attachedAssets
    postBlocks.value = parsePostHtmlToBlocks(response.postBody || '', attachedAssets)
    seoFields.value = {
      brand: response.brand || '',
      model: response.model || '',
    }
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

const buildEditFormData = () => {
  const formData = new FormData()

  formData.append('postTitle', postTitle.value.trim())
  formData.append('postBody', postBodyHtml.value)
  formData.append('brand', seoFields.value.brand.trim())
  formData.append('model', seoFields.value.model.trim())
  formData.append('locationFocus', siteProfile.locationLabel)

  referencedAssets.value
    .filter((asset) => asset.file && asset.thumbnailFile)
    .forEach((asset) => {
      formData.append('extraImages', asset.file)
      formData.append('thumbnails', asset.thumbnailFile)
      formData.append('extraImageIds', asset.id)
    })

  return formData
}

const savePostChanges = async () => {
  if (!post.value) {
    return
  }

  isSaving.value = true

  try {
    const result = await saveEdit(post.value.postId, buildEditFormData())

    if (result?.success) {
      await loadPost(post.value.postId)
    }
  } finally {
    isSaving.value = false
  }
}

const removePost = async () => {
  if (!post.value) {
    return
  }

  const confirmed = window.confirm('Delete this post? This action cannot be undone.')

  if (!confirmed) {
    return
  }

  isDeleting.value = true
  const deleted = await deletePost(post.value.postId)
  isDeleting.value = false

  if (deleted) {
    cancelEdit()
    postBlocks.value = []
    postAssets.value = []
    router.push('/my-work')
  }
}

const openCreateView = () => {
  cancelEdit()
  router.push('/admin/editor')
}

const updateSeoFields = (value) => {
  seoFields.value = value
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
  <section class="relative mx-auto my-4 max-w-6xl px-4 py-12 sm:my-22 sm:px-6 lg:px-8">
    <div class="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="space-y-4">
        <p class="text-acc text-sm tracking-widest uppercase">Admin Editor</p>
        <h1 class="font-sec text-fg text-3xl font-light tracking-wider uppercase md:text-4xl">
          {{ isEditMode ? 'Edit Workshop Post' : 'Create Workshop Post' }}
        </h1>
        <p class="text-fg/80 dark:text-fg/82 max-w-3xl leading-relaxed">
          {{
            isEditMode
              ? 'Adjust the featured image, title, and story blocks in the same order visitors will read the post.'
              : 'Create a workshop post from the dedicated editor route.'
          }}
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <a
          v-if="isEditMode && post"
          :href="post.canonicalPath || buildCanonicalPostPath(post)"
          target="_blank"
          rel="noopener noreferrer"
          class="border-brdr dark:border-sec-mute text-fg hover:text-acc hover:border-acc inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm tracking-wider uppercase transition-colors"
        >
          <ArrowTopRightOnSquareIcon class="size-4" />
          View Public Page
        </a>
      </div>
    </div>

    <AdminNewPost v-if="!isEditMode" embedded />

    <div v-else-if="isLoading" class="space-y-8">
      <div class="bg-fg/8 aspect-video animate-pulse rounded-lg dark:bg-white/6"></div>
      <div class="bg-fg/10 h-12 w-full rounded-lg dark:bg-white/10"></div>
      <div class="space-y-4">
        <div class="bg-fg/10 h-40 rounded-lg dark:bg-white/10"></div>
        <div class="bg-fg/10 h-40 rounded-lg dark:bg-white/10"></div>
      </div>
    </div>

    <div
      v-else-if="loadError || !post"
      class="bg-primary dark:bg-sec/80 border-brdr dark:border-sec-mute rounded-lg border p-8 text-center shadow-lg"
    >
      <h2 class="font-sec text-fg text-2xl">Post unavailable</h2>
      <p class="text-fg/80 mx-auto mt-3 max-w-2xl leading-relaxed">
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

    <div v-else class="space-y-10">
      <div class="space-y-3">
        <p class="input-lbl">Featured Image</p>
        <div
          class="border-brdr dark:border-sec-mute bg-sec-light/35 dark:bg-sec/35 overflow-hidden rounded-lg border"
        >
          <img
            v-if="featuredImageUrl"
            :src="featuredImageUrl"
            :alt="post.postTitle || 'Featured image'"
            class="aspect-video h-full w-full object-cover"
          />
          <div v-else class="bg-fg/5 flex aspect-video items-center justify-center">
            <PhotoIcon class="text-fg/30 size-16" />
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label for="edit-post-title" class="input-lbl">Post Title</label>
        <input
          id="edit-post-title"
          v-model="postTitle"
          name="post_title"
          type="text"
          class="input"
          placeholder="Post title"
          :disabled="isSaving || isDeleting"
        />
      </div>

      <PostSeoFields
        :fields="seoFields"
        :disabled="isSaving || isDeleting"
        @update:fields="updateSeoFields"
      />

      <div class="space-y-3">
        <p class="input-lbl">Post Body</p>
        <PostBlockBuilder
          v-model="postBlocks"
          v-model:assets="postAssets"
          :disabled="isSaving || isDeleting"
        />
      </div>

      <div class="flex flex-wrap items-center gap-3 pt-4">
        <button
          type="button"
          class="bg-acc hover:bg-acc/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium tracking-wider text-white uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSaving"
          @click="savePostChanges"
        >
          <CheckBadgeIcon class="size-4" />
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>

        <button
          type="button"
          class="border-danger/40 text-danger hover:bg-danger/10 inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeleting"
          @click="removePost"
        >
          <TrashIcon class="size-4" />
          {{ isDeleting ? 'Deleting...' : 'Delete Post' }}
        </button>
      </div>
    </div>
  </section>
</template>
