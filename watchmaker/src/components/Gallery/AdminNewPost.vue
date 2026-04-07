<script setup>
import { computed, ref } from 'vue'
import { useDateFormat, useNow } from '@vueuse/core'
import { CloudArrowUpIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/vue/24/outline'
import PostBlockBuilder from '@/components/posts/PostBlockBuilder.vue'
import { usePostType } from '@/composables/utils'
import { useImageCompression } from '@/composables/useImageCompression'
import { usePostsStore } from '@/stores/usePostsStore.js'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'
import { buildPostHtmlFromBlocks, getReferencedAssetIds } from '@/utils/postBlocks'

const MAX_FILE_SIZE = 15 * 1024 * 1024
const MAX_COMPRESSED_SIZE_KB = 800
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const props = defineProps({
  embedded: {
    type: Boolean,
    default: false,
  },
})

const { compressToSize } = useImageCompression()
const postsStore = usePostsStore()
const { isUploading } = storeToRefs(postsStore)
const toastStore = useToastStore()
const toast = (message, type = 'info') => toastStore.showToast(message, type)

const newPost = ref({
  title: '',
  titleImage: [],
})

const titleFile = ref(null)
const postBlocks = ref([])
const postAssets = ref([])
const isProcessing = ref(false)
const isDraggingFeaturedImage = ref(false)
const titleFileInputRef = ref(null)

const referencedAssetIds = computed(() => getReferencedAssetIds(postBlocks.value))
const referencedAssets = computed(() =>
  postAssets.value.filter((asset) => referencedAssetIds.value.has(`${asset.id}`)),
)

const postTypeState = computed(() => ({
  title: newPost.value.title,
  bodyText: buildPostHtmlFromBlocks(postBlocks.value, referencedAssets.value, { useTokens: true }),
  titleImage: newPost.value.titleImage,
  extraImages: referencedAssets.value,
}))

const postType = usePostType(postTypeState)

const computedButtonState = computed(() => {
  if (isProcessing.value) return { text: 'Processing Image...', disabled: true }
  if (isUploading.value) return { text: 'Creating Post...', disabled: true }
  return { text: 'Publish Post', disabled: false }
})

const createPreview = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const validateImageFile = (file) => {
  if (!file?.type?.startsWith('image/')) {
    toast('Please select a valid image file.', 'error')
    return false
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    toast('Only JPEG, PNG, and WebP images are allowed.', 'warning')
    return false
  }

  if (file.size > MAX_FILE_SIZE) {
    toast('Featured images must be smaller than 15MB before compression.', 'error')
    return false
  }

  return true
}

const processFeaturedImage = async (file) => {
  if (!validateImageFile(file)) {
    return false
  }

  isProcessing.value = true

  try {
    const targetSize = file.size > 10 * 1024 * 1024 ? 1000 : MAX_COMPRESSED_SIZE_KB
    const compressed = await compressToSize(file, targetSize, {
      maxWidth: 1920,
      initialQuality: 0.85,
      preserveFormat: file.type !== 'image/png' || file.size < 5 * 1024 * 1024,
      aggressiveResize: true,
    })

    titleFile.value = compressed
    newPost.value.titleImage = [await createPreview(compressed)]
    return true
  } catch (error) {
    console.error('Error processing featured image:', error)
    toast('Failed to process the featured image. Please try again.', 'error')
    return false
  } finally {
    isProcessing.value = false
  }
}

const handleFeaturedImageInput = async (event) => {
  const file = event.target.files?.[0]
  if (file) {
    await processFeaturedImage(file)
    event.target.value = ''
  }
}

const handleFeaturedImageDrop = async (event) => {
  isDraggingFeaturedImage.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await processFeaturedImage(file)
  }
}

const triggerFeaturedImageUpload = () => {
  if (!computedButtonState.value.disabled) {
    titleFileInputRef.value?.click()
  }
}

const removeTitleImage = () => {
  newPost.value.titleImage = []
  titleFile.value = null
  if (titleFileInputRef.value) {
    titleFileInputRef.value.value = ''
  }
}

const validatePost = () => {
  const errors = []

  if (!newPost.value.title.trim()) {
    errors.push('Post title is required.')
  }

  if (!titleFile.value) {
    errors.push('Featured image is required.')
  }

  return errors
}

const resetForm = () => {
  Object.assign(newPost.value, {
    title: '',
    titleImage: [],
  })

  titleFile.value = null
  postBlocks.value = []
  postAssets.value = []

  if (titleFileInputRef.value) {
    titleFileInputRef.value.value = ''
  }
}

async function saveNewPost(event) {
  event?.preventDefault()

  const errors = validatePost()
  if (errors.length) {
    toast(errors[0], 'warning')
    return
  }

  try {
    const formData = new FormData()
    const date = useDateFormat(useNow(), 'DD-MM-YYYY').value
    const bodyText = buildPostHtmlFromBlocks(postBlocks.value, referencedAssets.value, {
      useTokens: true,
    })

    formData.append('title', newPost.value.title.trim())
    formData.append('bodyText', bodyText.trim())
    formData.append('date', date)
    formData.append('type', postType.value)
    formData.append('titleImage', titleFile.value)

    referencedAssets.value
      .filter((asset) => asset.file && asset.thumbnailFile)
      .forEach((asset) => {
        formData.append('extraImages', asset.file)
        formData.append('thumbnails', asset.thumbnailFile)
        formData.append('extraImageIds', asset.id)
      })

    const result = await postsStore.createPost(formData)

    if (result?.success) {
      resetForm()
      toast('Post created successfully!', 'success')
    }
  } catch (error) {
    console.error('Error saving post:', error)
    toast('Failed to save post. Please try again.', 'error')
  }
}
</script>

<template>
  <section class="space-y-10">
    <div v-if="!props.embedded" class="space-y-3">
      <h1 class="font-sec text-fg text-3xl font-light tracking-[0.18em] uppercase md:text-4xl">
        Create Workshop Post
      </h1>
      <p class="text-fg/72 dark:text-fg/82 max-w-3xl leading-relaxed">
        Start with the featured image and title, then build the story one block at a time.
      </p>
    </div>

    <div class="space-y-10">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label class="input-lbl" for="new-post-featured-image">Featured Image</label>
          <span class="text-acc bg-acc/10 rounded-lg px-2 py-1 text-sm">Required</span>
        </div>

        <div
          class="border-brdr dark:border-sec-mute bg-sec-light/35 dark:bg-sec/35 overflow-hidden rounded-lg border transition-colors"
          :class="{ 'border-acc bg-acc/5': isDraggingFeaturedImage }"
          @dragover.prevent
          @dragenter.prevent="isDraggingFeaturedImage = true"
          @dragleave.prevent="isDraggingFeaturedImage = false"
          @drop.prevent="handleFeaturedImageDrop"
        >
          <div
            v-if="newPost.titleImage.length === 0"
            class="flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 px-6 text-center"
            @click="triggerFeaturedImageUpload"
          >
            <div class="bg-acc/10 text-acc flex size-16 items-center justify-center rounded-lg">
              <CloudArrowUpIcon class="size-8" />
            </div>
            <div class="space-y-2">
              <p class="text-fg/92 dark:text-fg/96 text-lg font-medium">
                Click or drop the featured image here
              </p>
              <p class="text-fg/60 dark:text-fg/72 text-sm">JPEG, PNG, or WebP up to 15MB.</p>
            </div>
          </div>

          <div v-else class="relative aspect-[16/9] overflow-hidden bg-black/5">
            <img
              :src="newPost.titleImage[0]"
              alt="Featured image preview"
              class="h-full w-full object-cover"
            />

            <div
              class="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 p-4"
            >
              <span class="text-sm font-medium text-white">Featured image</span>
              <button
                type="button"
                class="bg-danger hover:bg-danger/90 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors"
                @click="removeTitleImage"
              >
                <TrashIcon class="size-4" />
                Remove
              </button>
            </div>
          </div>
        </div>

        <input
          id="new-post-featured-image"
          ref="titleFileInputRef"
          name="title_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          :disabled="computedButtonState.disabled"
          @change="handleFeaturedImageInput"
        />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label for="new-post-title" class="input-lbl">Post Title</label>
          <span class="text-acc bg-acc/10 rounded-lg px-2 py-1 text-sm">Required</span>
        </div>

        <input
          id="new-post-title"
          v-model="newPost.title"
          name="post_title"
          type="text"
          class="input"
          placeholder="Give the post a title..."
          :disabled="computedButtonState.disabled"
        />
      </div>

      <div class="space-y-3">
        <p class="input-lbl">Post Body</p>

        <PostBlockBuilder
          v-model="postBlocks"
          v-model:assets="postAssets"
          :disabled="computedButtonState.disabled"
        />
      </div>

      <div class="flex flex-wrap items-center gap-4 pt-4">
        <button
          type="button"
          class="bg-acc hover:bg-acc/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium tracking-[0.15em] text-white uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="computedButtonState.disabled"
          @click="saveNewPost($event)"
        >
          <PaperAirplaneIcon v-if="!isProcessing && !isUploading" class="size-5 -rotate-90" />
          <span
            v-else
            class="inline-flex size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
          ></span>
          {{ computedButtonState.text }}
        </button>

        <p class="text-fg/60 dark:text-fg/72 text-sm">
          {{ referencedAssets.length }} block image{{ referencedAssets.length === 1 ? '' : 's' }}
          ready to save with this post.
        </p>
      </div>
    </div>
  </section>
</template>
