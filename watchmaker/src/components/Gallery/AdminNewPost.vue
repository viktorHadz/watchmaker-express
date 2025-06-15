<script setup>
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'
import placeHolder from '../icons/placeHolder.vue'
import pocketWatch from '../icons/pocketWatch.vue'
import { useToastStore } from '@/stores/toast'
import { useDateFormat, useNow } from '@vueuse/core'
import { usePostType } from '@/composables/utils'
import { CloudArrowUpIcon, PaperAirplaneIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { usePostsStore } from '@/stores/usePostsStore.js'
import { storeToRefs } from 'pinia'
import { useImageCompression } from '@/composables/useImageCompression'

const MAX_EXTRA_IMAGES = 5
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const postsStore = usePostsStore()
const { isUploading } = storeToRefs(postsStore)
const toastStore = useToastStore()
const toast = (msg, type = 'info') => toastStore.showToast(msg, type)

// State
const newPost = ref({
  title: '',
  bodyText: '',
  titleImage: [],
  extraImages: [],
  thumbnails: [],
})

const titleFile = ref(null)
const extraFiles = ref([])
const thumbnailFiles = ref([])

const postType = usePostType(newPost)
const titleFileInputRef = ref(null)
const extraFileInputRef = ref(null)

const { compressImage } = useImageCompression()
const generateThumbnail = (file) => compressImage(file, 150, 0.5)

// Helpers with error handling
const createPreview = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const validateImageFile = (file) => {
  if (!file?.type?.startsWith('image/')) return false
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast('Only JPEG, PNG, and WebP images are allowed', 'warning')
    return false
  }
  if (file.size > MAX_FILE_SIZE) {
    toast(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`, 'error')
    return false
  }
  return true
}

const canAddExtraImages = (count = 1) => {
  if (extraFiles.value.length + count > MAX_EXTRA_IMAGES) {
    toast(`Maximum ${MAX_EXTRA_IMAGES} extra images allowed`, 'warning')
    return false
  }
  return true
}

// Image processing
async function processImage(file, isExtra = false) {
  if (!validateImageFile(file)) return false
  if (isExtra && !canAddExtraImages()) return false

  try {
    const compressed = await compressImage(file)

    if (isExtra) {
      const thumbnail = await generateThumbnail(file)
      const [preview, thumbPreview] = await Promise.all([
        createPreview(compressed),
        createPreview(thumbnail),
      ])

      extraFiles.value.push(compressed)
      thumbnailFiles.value.push(thumbnail)
      newPost.value.extraImages.push(preview)
      newPost.value.thumbnails.push(thumbPreview)
    } else {
      titleFile.value = compressed
      newPost.value.titleImage = [await createPreview(compressed)]
    }
    return true
  } catch (error) {
    console.error('Error processing image:', error)
    toast('Failed to process image. Please try again.', 'error')
    return false
  }
}

// Batch processing for multiple files
async function processFiles(files, isExtra = false) {
  const toProcess = isExtra
    ? files.slice(0, MAX_EXTRA_IMAGES - extraFiles.value.length)
    : [files[0]]
  let processed = 0

  for (const file of toProcess) {
    if (await processImage(file, isExtra)) processed++
  }

  return processed
}

// Drop zones with unified handler
const createDropHandler = (isExtra = false) => ({
  async onDrop(files) {
    try {
      await processFiles(Array.from(files), isExtra)
    } catch (error) {
      console.error('Error processing dropped files:', error)
      toast('Error processing images. Please try again.', 'error')
    }
  },
  dataTypes: ALLOWED_TYPES,
  multiple: isExtra,
})

const titleDropZoneRef = ref(null)
const extraImageDropZoneRef = ref(null)
const { isOverDropZone } = useDropZone(titleDropZoneRef, createDropHandler(false))
const { isOverDropZone: isOverExtraDropZone } = useDropZone(
  extraImageDropZoneRef,
  createDropHandler(true),
)

// File inputs
const handleFileInput = async (event, isExtra = false) => {
  const files = Array.from(event.target.files || [])
  if (files.length) {
    await processFiles(files, isExtra)
    event.target.value = ''
  }
}

const triggerTitleUpload = () => titleFileInputRef.value?.click()
const triggerExtraUpload = () => canAddExtraImages() && extraFileInputRef.value?.click()

// Validation
const validatePost = () => {
  const errors = []
  if (!newPost.value.title.trim()) errors.push('Title is required')
  if (!titleFile.value && !extraFiles.value.length) errors.push('At least one image is required')
  if (extraFiles.value.length !== thumbnailFiles.value.length)
    errors.push('Thumbnail generation error')
  return errors
}

// Save
async function saveNewPost(e) {
  e?.preventDefault()

  const errors = validatePost()
  if (errors.length) {
    toast(errors[0], 'warning')
    return
  }

  try {
    const formData = new FormData()
    const date = useDateFormat(useNow(), 'DD-MM-YYYY').value

    Object.entries({
      title: newPost.value.title.trim(),
      bodyText: newPost.value.bodyText.trim(),
      date,
      type: postType.value,
    }).forEach(([k, v]) => formData.append(k, v))

    if (titleFile.value) formData.append('titleImage', titleFile.value)
    extraFiles.value.forEach((f) => formData.append('extraImages', f))
    thumbnailFiles.value.forEach((f) => formData.append('thumbnails', f))

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

// Reset & Remove
const resetForm = () => {
  Object.assign(newPost.value, {
    title: '',
    bodyText: '',
    titleImage: [],
    extraImages: [],
    thumbnails: [],
  })
  titleFile.value = null
  extraFiles.value = []
  thumbnailFiles.value = []
  titleFileInputRef.value && (titleFileInputRef.value.value = '')
  extraFileInputRef.value && (extraFileInputRef.value.value = '')
}

const removeTitleImage = () => {
  newPost.value.titleImage = []
  titleFile.value = null
  titleFileInputRef.value && (titleFileInputRef.value.value = '')
}

const removeExtraImage = (index) => {
  if (index < 0 || index >= extraFiles.value.length) return

  newPost.value.extraImages.splice(index, 1)
  newPost.value.thumbnails.splice(index, 1)
  extraFiles.value.splice(index, 1)
  thumbnailFiles.value.splice(index, 1)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="relative z-[98] px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="font-sec text-fg mb-4 text-4xl font-semibold lg:text-5xl">Post Management</h1>
        <p class="text-fg/70 mx-auto max-w-3xl text-xl">
          Share your latest watch restorations and horological achievements
        </p>
      </div>
      <!-- CREATE NEW POST SECTION -->
      <div class="mx-auto max-w-6xl">
        <div
          class="bg-primary/90 dark:border-sec-mute/50 dark:bg-sec/90 overflow-hidden rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm"
        >
          <!-- Form Header -->
          <div
            class="from-acc/10 via-acc/5 border-brdr/10 border-b bg-gradient-to-r to-transparent p-4 sm:p-8"
          >
            <div class="flex items-center space-x-4">
              <div
                class="bg-acc/20 flex size-10 items-center justify-center rounded-lg sm:size-12 sm:rounded-xl"
              >
                <PlusIcon class="text-acc size-6"></PlusIcon>
              </div>
              <div>
                <h2 class="font-sec text-fg text-xl font-semibold sm:text-2xl">Create New Post</h2>
                <p class="text-acc text-md font-light sm:text-lg">Share your latest work</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- Image Upload Section -->
            <div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <!-- Title Image Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="input-lbl">Featured Image</h3>
                  <span class="text-acc bg-acc/10 rounded-full px-2 py-1 text-sm">Required</span>
                </div>

                <div
                  v-if="newPost.titleImage.length === 0"
                  ref="titleDropZoneRef"
                  :class="[
                    'group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                    isOverDropZone
                      ? 'border-acc bg-acc/10 scale-[1.02]'
                      : 'hover:border-acc/50 hover:bg-acc/5 border-brdr dark:border-sec-light',
                  ]"
                  @click="triggerTitleUpload"
                >
                  <div class="space-y-4 text-center">
                    <div class="flex items-center justify-center space-x-4">
                      <pocketWatch class="text-acc/60 h-12 w-12 -rotate-12 animate-pulse" />
                      <placeHolder class="text-acc/80 h-16 w-16" />
                      <pocketWatch class="text-acc/60 h-12 w-12 rotate-12 animate-pulse" />
                    </div>
                    <div class="space-y-2">
                      <p class="text-fg font-medium">Drop your featured image here</p>
                      <p class="text-fg/60 text-sm">or click to browse files</p>
                      <p class="text-fg/40 text-xs">JPEG, PNG, WebP up to 20MB</p>
                    </div>
                  </div>

                  <!-- Upload Icon -->
                  <div
                    class="dark:bg-sec/80 absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <CloudArrowUpIcon class="text-acc size-5"></CloudArrowUpIcon>
                  </div>
                </div>

                <!-- Title Image Preview -->
                <div v-else class="group relative">
                  <div class="relative overflow-hidden rounded-xl">
                    <img
                      :src="newPost.titleImage[0]"
                      alt="Featured Image"
                      class="h-64 w-full object-cover"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <div
                        class="absolute right-4 bottom-4 left-4 flex items-center justify-between"
                      >
                        <span class="rounded bg-black/30 px-2 py-1 text-sm font-medium text-white"
                          >Featured Image</span
                        >
                        <button
                          type="button"
                          @click="removeTitleImage"
                          class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                        >
                          <TrashIcon class="size-4"></TrashIcon>
                        </button>
                      </div>
                    </div>
                    <!-- Mobile remove button - always visible -->
                    <button
                      type="button"
                      @click="removeTitleImage"
                      class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg md:hidden"
                    >
                      <TrashIcon class="size-4"></TrashIcon>
                    </button>
                  </div>
                </div>

                <input
                  ref="titleFileInputRef"
                  type="file"
                  name="title_image_file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="handleFileInput($event, false)"
                />
              </div>

              <!-- Extra Images Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="input-lbl">Additional Images</h3>
                  <span class="text-fg bg-sec-light dark:bg-sec-mute rounded-full px-2 py-1 text-sm"
                    >Optional</span
                  >
                </div>

                <div
                  ref="extraImageDropZoneRef"
                  :class="[
                    'group relative flex min-h-[280px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                    isOverExtraDropZone
                      ? 'border-acc bg-acc/10 scale-[1.02]'
                      : 'hover:border-acc/50 border-brdr dark:border-sec-light',
                  ]"
                  @click="triggerExtraUpload"
                >
                  <div
                    v-if="newPost.extraImages.length === 0"
                    class="flex h-full flex-col items-center justify-center p-6"
                  >
                    <div class="space-y-4 text-center">
                      <div class="flex items-center justify-center space-x-4">
                        <pocketWatch class="text-acc/60 h-10 w-10 -rotate-12" />
                        <placeHolder class="text-acc/80 h-14 w-14" />
                        <pocketWatch class="text-acc/60 h-10 w-10 rotate-12" />
                      </div>
                      <div class="space-y-2">
                        <p class="text-fg font-medium">Add more photos</p>
                        <p class="text-fg/60 text-sm">Drop multiple images or click to browse</p>
                      </div>
                    </div>
                  </div>

                  <!-- Extra Images Grid -->
                  <div v-else class="p-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div
                        v-for="(img, index) in newPost.extraImages"
                        :key="index"
                        class="group relative"
                      >
                        <div class="relative aspect-square overflow-hidden rounded-lg">
                          <img :src="img" class="h-full w-full object-cover" />
                          <div
                            class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30 md:bg-black/0 md:group-hover:bg-black/30"
                          >
                            <button
                              type="button"
                              @click.stop="removeExtraImage(index)"
                              class="h-8 w-8 rounded-full bg-red-500 text-white opacity-100 transition-opacity hover:bg-red-600 md:opacity-0 md:group-hover:opacity-100"
                            >
                              <TrashIcon class="mx-auto size-4"></TrashIcon>
                            </button>
                          </div>
                          <!-- Mobile remove button - always visible -->
                          <button
                            type="button"
                            @click.stop="removeExtraImage(index)"
                            class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md md:hidden"
                          >
                            <TrashIcon class="size-3"></TrashIcon>
                          </button>
                        </div>
                      </div>

                      <!-- Add More Button -->
                      <div
                        v-if="extraFiles.length < MAX_EXTRA_IMAGES"
                        class="border-acc/30 hover:bg-acc/5 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                      >
                        <PlusIcon class="text-acc/60 size-8"></PlusIcon>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref="extraFileInputRef"
                  type="file"
                  name="extra_images_file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  class="hidden"
                  @change="handleFileInput($event, true)"
                />
              </div>
            </div>

            <!-- Text Content Section -->
            <div class="space-y-6">
              <div class="grid grid-cols-1">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <label for="new-title-input" class="input-lbl">Post Title</label>
                    <span class="text-acc bg-acc/10 rounded-full px-2 py-1 text-sm">Required</span>
                  </div>

                  <input
                    v-model="newPost.title"
                    type="text"
                    id="new-title-input"
                    class="input"
                    placeholder="Give your post a compelling title..."
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between">
                  <label for="new-post-body" class="input-lbl">Description</label>
                  <span class="text-fg bg-sec-light dark:bg-sec-mute rounded-full px-2 text-sm"
                    >Optional</span
                  >
                </div>

                <textarea
                  v-model="newPost.bodyText"
                  rows="4"
                  id="new-post-body"
                  class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc input w-full resize-none rounded-xl"
                  placeholder="Describe the work done, techniques used, or story behind this watch piece..."
                ></textarea>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-center pt-8">
              <button
                @click="saveNewPost($event)"
                :disabled="isUploading"
                class="from-acc to-acc/80 hover:from-acc/90 hover:to-acc/70 focus:ring-acc/50 inline-flex transform cursor-pointer items-center rounded-xl bg-gradient-to-r px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:outline-none"
                :class="{ 'cursor-not-allowed opacity-50': isUploading }"
              >
                <PaperAirplaneIcon class="mr-2 size-5 -rotate-90 transform"></PaperAirplaneIcon>

                {{ isUploading ? 'Creating Post...' : 'Publish Post' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
