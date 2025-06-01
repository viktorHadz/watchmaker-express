<script setup>
import { ref } from 'vue'
import { useDropZone } from '@vueuse/core'
import placeHolder from './icons/placeHolder.vue'
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
import pocketWatch from './icons/pocketWatch.vue'
import { useDateFormat, useNow } from '@vueuse/core'
import { usePostType } from '@/composables/utils'
import GalleryEl from './Gallery/GalleryEl.vue'
import { CloudArrowUpIcon, PaperAirplaneIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

// Empty object to use when creating new post (for preview only now)
const newPost = ref({
  title: '',
  bodyText: '',
  titleImage: [],
  extraImages: [],
  thumbnails: [],
})

// Store actual files separately for FormData
const titleFile = ref(null)
const extraFiles = ref([])
const thumbnailFiles = ref([])

// Loading state to prevent multiple submissions
const isUploading = ref(false)

// Computes the post type(see return sig)
const postType = usePostType(newPost)

// Refs for file inputs
const titleFileInputRef = ref(null)
const extraFileInputRef = ref(null)

// Image compression function with better quality
function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Set canvas size and draw compressed image
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Determine output format based on original file type
      let outputType = 'image/jpeg'
      if (file.type === 'image/png') outputType = 'image/png'
      if (file.type === 'image/webp') outputType = 'image/webp'

      // Convert back to blob with original filename info
      canvas.toBlob(
        (blob) => {
          // Add filename property to blob for better handling
          blob.name = file.name
          blob.lastModified = file.lastModified
          resolve(blob)
        },
        outputType,
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Generate thumbnail with lower quality and smaller size
function generateThumbnail(file) {
  return compressImage(file, 150, 0.5)
}

// Validation function
function validatePost() {
  const errors = []

  if (!newPost.value.title.trim()) {
    errors.push('Title is required')
  }

  if (!titleFile.value && extraFiles.value.length === 0) {
    errors.push('At least one image is required')
  }

  if (extraFiles.value.length > 5) {
    errors.push('Maximum 5 extra images allowed')
  }

  // Validate thumbnails match extra images
  if (extraFiles.value.length !== thumbnailFiles.value.length) {
    errors.push('Thumbnail generation error')
  }

  return errors
}

async function saveNewPost(e) {
  console.log('Event log: ', e)
  e.preventDefault()
  console.log('1. Starting saveNewPost')
  if (isUploading.value) return

  // Validate post
  const errors = validatePost()
  if (errors.length > 0) {
    toast.showToast(errors[0], 'warning')
    console.warn('Validation errors:', errors)
    return
  }

  isUploading.value = true

  try {
    const formatedCurrentDate = useDateFormat(useNow(), 'DD-MM-YYYY')
    const date = formatedCurrentDate.value

    // Create FormData
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('bodyText', newPost.value.bodyText)
    formData.append('date', date)
    formData.append('type', postType.value)

    // Add files
    if (titleFile.value) {
      formData.append('titleImage', titleFile.value)
    }

    // Add extra images and their thumbnails
    extraFiles.value.forEach((file) => {
      formData.append('extraImages', file)
    })

    thumbnailFiles.value.forEach((file) => {
      formData.append('thumbnails', file)
    })

    const success = await sendNewPost(formData)
    console.log('2. sendNewPost completed, success:', success)
    // Only reset form if upload was successful
    if (success) {
      resetForm()
      toast.showToast('Post created successfully!', 'success')
    }
  } catch (error) {
    console.error('Error saving post:', error)
    toast.showToast('Failed to save post', 'error')
  } finally {
    isUploading.value = false
  }
}

async function sendNewPost(formData) {
  try {
    const response = await fetch('/api/posts/new-post', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `Server error: ${response.status}`)
    }

    console.log('Server response:', result)
    return true
  } catch (error) {
    console.error('Network error:', error)
    toast.showToast(error.message, 'error')
    return false
  }
}

// Reset form function
function resetForm() {
  newPost.value = {
    title: '',
    bodyText: '',
    titleImage: [],
    extraImages: [],
    thumbnails: [],
  }
  titleFile.value = null
  extraFiles.value = []
  thumbnailFiles.value = []

  // Reset file inputs
  if (titleFileInputRef.value) titleFileInputRef.value.value = null
  if (extraFileInputRef.value) extraFileInputRef.value.value = null
}

const titleDropZoneRef = ref(null)
const extraImageDropZoneRef = ref(null)

// Title Image Drop
const { isOverDropZone } = useDropZone(titleDropZoneRef, {
  async onDrop(event) {
    const file = Array.from(event)[0]
    if (!file || !file.type.startsWith('image/')) return

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.showToast('Only JPEG, PNG, and WebP images are allowed', 'warning')
      return
    }

    // Compress the file
    const compressedFile = await compressImage(file)
    titleFile.value = compressedFile

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.value.titleImage = [e.target.result]
    }
    reader.readAsDataURL(compressedFile)
  },
  dataTypes: ['image/jpeg', 'image/png', 'image/webp'],
  multiple: false,
})

// Extra Images Drop
const { isOverDropZone: isOverExtraDropZone } = useDropZone(extraImageDropZoneRef, {
  async onDrop(event) {
    const files = Array.from(event)

    // Check total count
    if (extraFiles.value.length + files.length > 5) {
      toast.showToast('Maximum 5 extra images allowed', 'warning')
      return
    }

    for (const file of files) {
      if (!file || !file.type.startsWith('image/')) continue

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.showToast('Only JPEG, PNG, and WebP images are allowed', 'warning')
        continue
      }

      // Compress main image and generate thumbnail
      const compressedFile = await compressImage(file)
      const thumbnailFile = await generateThumbnail(file)

      extraFiles.value.push(compressedFile)
      thumbnailFiles.value.push(thumbnailFile)

      // Create preview for extra image
      const reader = new FileReader()
      reader.onload = (e) => {
        newPost.value.extraImages.push(e.target.result)
      }
      reader.readAsDataURL(compressedFile)

      // Create preview for thumbnail
      const thumbReader = new FileReader()
      thumbReader.onload = (e) => {
        newPost.value.thumbnails.push(e.target.result)
      }
      thumbReader.readAsDataURL(thumbnailFile)
    }
  },
  dataTypes: ['image/jpeg', 'image/png', 'image/webp'],
  multiple: true,
})

// File Upload Functions using refs
function triggerTitleUpload() {
  titleFileInputRef.value?.click()
}

function triggerExtraUpload() {
  if (extraFiles.value.length >= 5) {
    toast.showToast('Maximum 5 extra images allowed', 'warning')
    return
  }
  extraFileInputRef.value?.click()
}

// File Upload Fallbacks
async function insertNewTitleImage(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    toast.showToast('Only JPEG, PNG, and WebP images are allowed', 'warning')
    return
  }

  // Compress the file
  const compressedFile = await compressImage(file)
  titleFile.value = compressedFile

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    newPost.value.titleImage = [e.target.result]
  }
  reader.readAsDataURL(compressedFile)
}

async function handleFileChange(event) {
  const files = Array.from(event.target.files || [])

  // Check total count
  if (extraFiles.value.length + files.length > 5) {
    toast.showToast('Maximum 5 extra images allowed', 'warning')
    return
  }

  for (const file of files) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.showToast('Only JPEG, PNG, and WebP images are allowed', 'warning')
      continue
    }

    // Compress main image and generate thumbnail
    const compressedFile = await compressImage(file)
    const thumbnailFile = await generateThumbnail(file)

    extraFiles.value.push(compressedFile)
    thumbnailFiles.value.push(thumbnailFile)

    // Create preview for extra image
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.value.extraImages.push(e.target.result)
    }
    reader.readAsDataURL(compressedFile)

    // Create preview for thumbnail (optional - remove if not needed)
    const thumbReader = new FileReader()
    thumbReader.onload = (e) => {
      newPost.value.thumbnails.push(e.target.result)
    }
    thumbReader.readAsDataURL(thumbnailFile)
  }

  // Clear input for next selection
  event.target.value = ''
}

// Remove image functions
function removeTitleImage() {
  newPost.value.titleImage = []
  titleFile.value = null
}

function removeExtraImage(index) {
  // Remove from all arrays at the same index
  newPost.value.extraImages.splice(index, 1)
  newPost.value.thumbnails.splice(index, 1)
  extraFiles.value.splice(index, 1)
  thumbnailFiles.value.splice(index, 1)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="font-sec text-fg mb-4 text-4xl font-semibold lg:text-5xl">Post Management</h1>
        <p class="text-fg/70 mx-auto max-w-3xl text-xl">
          Share your latest watch restorations and horological achievements
        </p>
      </div>
      <!-- CREATE NEW POST SECTION -->
      <div class="mx-auto mb-16 max-w-6xl">
        <div
          class="overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/90"
        >
          <!-- Form Header -->
          <div
            class="from-acc/10 via-acc/5 border-brdr/10 border-b bg-gradient-to-r to-transparent p-8"
          >
            <div class="flex items-center space-x-4">
              <div class="bg-acc/20 flex h-12 w-12 items-center justify-center rounded-xl">
                <PlusIcon class="text-acc size-6"></PlusIcon>
              </div>
              <div>
                <h2 class="font-sec text-fg text-2xl font-semibold">Create New Post</h2>
                <p class="text-fg/70">Share your latest work with the community</p>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- Image Upload Section -->
            <div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <!-- Title Image Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-sec text-fg text-lg font-semibold">Featured Image</h3>
                  <span class="text-fg/60 bg-acc/10 rounded-full px-2 py-1 text-sm">Required</span>
                </div>

                <div
                  v-if="newPost.titleImage.length === 0"
                  ref="titleDropZoneRef"
                  :class="[
                    'group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                    isOverDropZone
                      ? 'border-acc bg-acc/10 scale-[1.02]'
                      : 'hover:border-acc/50 hover:bg-acc/5 border-slate-300 dark:border-slate-600',
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
                      <p class="text-fg/40 text-xs">JPEG, PNG, WebP up to 10MB</p>
                    </div>
                  </div>

                  <!-- Upload Icon -->
                  <div
                    class="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700/80"
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
                      class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
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
                  </div>
                </div>

                <input
                  ref="titleFileInputRef"
                  type="file"
                  name="title_image_file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="insertNewTitleImage"
                />
              </div>

              <!-- Extra Images Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-sec text-fg text-lg font-semibold">Additional Images</h3>
                  <span
                    class="text-fg/60 rounded-full bg-slate-100 px-2 py-1 text-sm dark:bg-slate-700"
                    >Optional</span
                  >
                </div>

                <div
                  ref="extraImageDropZoneRef"
                  :class="[
                    'group relative flex min-h-[280px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300',
                    isOverExtraDropZone
                      ? 'border-acc bg-acc/10 scale-[1.02]'
                      : 'hover:border-acc/50 border-slate-300 dark:border-slate-600',
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
                            class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30"
                          >
                            <button
                              type="button"
                              @click.stop="removeExtraImage(index)"
                              class="h-8 w-8 rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            >
                              <TrashIcon class="mx-auto size-4"></TrashIcon>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Add More Button -->
                      <div
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
                  @change="handleFileChange"
                />
              </div>
            </div>

            <!-- Text Content Section -->
            <div class="space-y-6">
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div class="space-y-2">
                  <label class="font-sec text-fg text-lg font-semibold">Post Title</label>
                  <input
                    v-model="newPost.title"
                    type="text"
                    class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none dark:border-slate-600 dark:bg-slate-700"
                    placeholder="Give your post a compelling title..."
                  />
                </div>

                <div class="flex items-end">
                  <div class="w-full">
                    <div class="mb-2 flex items-center justify-between">
                      <span class="font-sec text-fg text-sm font-medium">Post Type</span>
                      <span class="bg-acc/10 text-acc rounded-full px-2 py-1 text-xs">{{
                        postType || 'Auto-detected'
                      }}</span>
                    </div>
                    <div
                      class="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-600 dark:bg-slate-700"
                    >
                      <span class="text-fg/70 capitalize">{{
                        postType || 'Will be detected automatically'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="font-sec text-fg text-lg font-semibold">Description</label>
                <textarea
                  v-model="newPost.bodyText"
                  rows="4"
                  class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-all duration-200 focus:ring-2 focus:outline-none dark:border-slate-600 dark:bg-slate-700"
                  placeholder="Describe the work done, techniques used, or story behind this piece..."
                ></textarea>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex justify-center pt-8">
              <button
                @click="saveNewPost($event)"
                :disabled="isUploading"
                class="from-acc to-acc/80 hover:from-acc/90 hover:to-acc/70 focus:ring-acc/50 inline-flex transform items-center rounded-xl bg-gradient-to-r px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:outline-none"
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
    <GalleryEl></GalleryEl>
  </div>
</template>
