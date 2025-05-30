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
// Historic posts filled from DB
const posts = ref([])

// Empty object to use when creating new post (for preview only now)
const newPost = ref({
  title: '',
  bodyText: '',
  titleImage: [],
  extraImages: [],
})

// Store actual files separately for FormData
const titleFile = ref(null)
const extraFiles = ref([])

// Loading state to prevent multiple submissions
const isUploading = ref(false)

// Computes the post type(see return sig)
const postType = usePostType(newPost)

// Refs for file inputs
const titleFileInputRef = ref(null)
const extraFileInputRef = ref(null)

// Image compression function with better quality
function compressImage(file, maxWidth = 1200, quality = 0.85) {
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

    extraFiles.value.forEach((file) => {
      formData.append('extraImages', file)
    })

    const success = await sendNewPost(formData)
    console.log('2. sendNewPost completed, success:', success)
    // Only reset form if upload was successful
    if (success) {
      console.log('3. About to reset form')
      resetForm()
      console.log('4. Form reset complete')

      console.log('5. About to show toast')
      toast.showToast('Post created successfully!', 'success')
      console.log('6. Toast shown')
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
  }
  titleFile.value = null
  extraFiles.value = []

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

      // Compress each file
      const compressedFile = await compressImage(file)
      extraFiles.value.push(compressedFile)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        newPost.value.extraImages.push(e.target.result)
      }
      reader.readAsDataURL(compressedFile)
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

    // Compress each file
    const compressedFile = await compressImage(file)
    extraFiles.value.push(compressedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      newPost.value.extraImages.push(e.target.result)
    }
    reader.readAsDataURL(compressedFile)
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
  newPost.value.extraImages.splice(index, 1)
  extraFiles.value.splice(index, 1)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="relative z-10 px-4 py-12 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="font-sec text-fg mb-4 text-4xl font-semibold lg:text-5xl">Gallery Management</h1>
        <p class="text-fg/70 mx-auto max-w-3xl text-xl">
          Share your latest watch restorations and horological achievements
        </p>
      </div>
      <GalleryEl></GalleryEl>
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
                <svg class="text-acc h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
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
                    class="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700/80"
                  >
                    <svg
                      class="text-acc h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
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
                          <svg
                            class="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
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
                    'group relative min-h-[280px] cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300',
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
                              <svg
                                class="mx-auto h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M6 18L18 6M6 6l12 12"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Add More Button -->
                      <div
                        class="border-acc/30 hover:bg-acc/5 flex aspect-square items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                      >
                        <svg
                          class="text-acc/60 h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
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
                <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
                {{ isUploading ? 'Creating Post...' : 'Publish Post' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- GALLERY SECTION -->
      <section class="mx-auto max-w-7xl">
        <!-- Gallery Header -->
        <div class="mb-12 text-center">
          <div
            class="inline-flex items-center space-x-3 rounded-2xl border border-white/20 bg-white/80 px-6 py-3 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80"
          >
            <svg class="text-acc h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
            <h2 class="font-sec text-fg text-2xl font-semibold">Workshop Gallery</h2>
          </div>
          <p class="text-fg/70 mx-auto mt-4 max-w-2xl">
            A showcase of precision craftsmanship and horological excellence
          </p>
        </div>

        <!-- Gallery Grid -->
        <div v-if="posts.length === 0" class="py-16 text-center">
          <div
            class="bg-acc/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
          >
            <svg
              class="text-acc/60 h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
              ></path>
            </svg>
          </div>
          <h3 class="font-sec text-fg mb-2 text-xl font-semibold">No posts yet</h3>
          <p class="text-fg/60">Create your first post to showcase your work</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article
            v-for="(post, i) in posts"
            :key="i"
            class="group cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700/50 dark:bg-slate-800/90"
          >
            <!-- Image -->
            <div class="relative aspect-[4/3] overflow-hidden">
              <img
                :src="post.titleImage || '/src/assets/pictures/placeholder.png'"
                :alt="post.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              ></div>

              <!-- Post Type Badge -->
              <div class="absolute top-3 left-3">
                <span
                  class="text-fg inline-flex items-center rounded-full border border-white/20 bg-white/90 px-2 py-1 text-xs font-medium dark:bg-slate-800/90"
                >
                  {{ post.type }}
                </span>
              </div>

              <!-- Date Badge -->
              <div class="absolute top-3 right-3">
                <span
                  class="text-fg inline-flex items-center rounded-full border border-white/20 bg-white/90 px-2 py-1 text-xs font-medium dark:bg-slate-800/90"
                >
                  {{ post.date }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <div v-if="post.type === 'blog' || post.type === 'mixed'" class="space-y-3">
                <h3
                  class="font-sec text-fg group-hover:text-acc line-clamp-2 text-lg font-semibold transition-colors"
                >
                  {{ post.title }}
                </h3>
                <p class="text-fg/70 line-clamp-3 text-sm leading-relaxed">
                  {{ post.bodyText }}
                </p>
              </div>
              <div v-else class="flex items-center justify-center py-4">
                <div class="bg-acc/10 flex h-12 w-12 items-center justify-center rounded-xl">
                  <svg
                    class="text-acc h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"
                    ></path>
                  </svg>
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
                      <img :src="img" class="h-full w-full object-cover" />
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
    </div>
  </div>
</template>
