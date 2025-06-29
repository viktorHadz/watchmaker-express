<!-- Update your FullPost.vue script section -->
<script setup>
import { ref, computed, watch } from 'vue'
import { usePostsStore } from '@/stores/usePostsStore'
import { useAuth } from '@/composables/useAuth'
import {
  XMarkIcon,
  CalendarIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  PencilIcon,
  CheckBadgeIcon,
  EyeSlashIcon,
  EyeIcon,
} from '@heroicons/vue/24/outline'
import { storeToRefs } from 'pinia'

const props = defineProps({
  post: {
    type: Object,
    default: () => ({}),
  },
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'share'])

// Get store instance and actions
const postsStore = usePostsStore()
const { isAuthenticated } = useAuth()

// Get reactive state from store
const { isEditing, editForm } = storeToRefs(postsStore)

// Get actions from store
const { saveEdit, openShareModal } = postsStore

const currentImageIndex = ref(0)
const showImageGallery = ref(true)

// Computed property to get all images (title + extra images)
const allImages = computed(() => {
  const images = []
  if (props.post.titleImage?.titlePath) {
    images.push(`/public${props.post.titleImage.titlePath}`)
  }
  if (props.post.extraImages?.length > 0) {
    props.post.extraImages.forEach((img) => {
      images.push(`/public${img.path}`)
    })
  }
  return images
})

const nextImage = () => {
  if (currentImageIndex.value < allImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const setCurrentImage = (index) => {
  currentImageIndex.value = index
}

const toggleImageGallery = () => {
  showImageGallery.value = !showImageGallery.value
}

const closeModal = () => {
  emit('close')
}

// Updated handleShare to use store function
const handleShare = () => {
  console.log('FullPost: Opening share modal for post:', props.post.postId)
  openShareModal(props.post)
  emit('share', props.post)
}

// Reset image index when post changes
watch(
  () => props.post.postId,
  () => {
    currentImageIndex.value = 0
    showImageGallery.value = true
  },
)

// Handle escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && props.show) {
    closeModal()
  }
  if (event.key === 'ArrowLeft' && props.show) {
    prevImage()
  }
  if (event.key === 'ArrowRight' && props.show) {
    nextImage()
  }
}

// Add/remove event listeners
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        @click="closeModal"
      ></div>
    </Transition>

    <!-- Modal Content -->
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-0 sm:p-4"
      >
        <div
          class="bg-primary/95 dark:bg-sec/95 dark:border-sec-mute pointer-events-auto relative flex h-full w-full max-w-4xl flex-col overflow-hidden border-0 border-white/20 shadow-2xl backdrop-blur-xl sm:max-h-[95vh] sm:rounded-2xl sm:border"
        >
          <!-- Header -->
          <div class="border-brdr/30 dark:border-sec-mute/30 border-b px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="min-w-0 flex-1">
                <div v-if="isAuthenticated && isEditing">
                  <input
                    type="text"
                    id="editing-post-id"
                    class="text-fg dark:text-fg2 font-sec focus:ring-acc/30 border-brdr/30 dark:border-sec-mute/30 dark:bg-sec/50 w-full rounded-lg border bg-transparent px-3 py-2 text-lg font-light tracking-wide focus:ring-2 focus:outline-none sm:text-xl"
                    placeholder="Post Title"
                    v-model="editForm.postTitle"
                  />
                </div>
                <div v-else>
                  <h2
                    class="text-fg dark:text-fg2 font-sec text-lg font-light tracking-wide sm:text-xl"
                  >
                    {{ post.postTitle || 'Untitled Post' }}
                  </h2>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="ml-3 flex items-center gap-1 sm:ml-4 sm:gap-2">
                <!-- Toggle Gallery Button -->
                <button
                  v-if="allImages.length > 0"
                  @click="toggleImageGallery"
                  class="text-fg/60 hover:text-fg hover:bg-sec-mute/30 dark:hover:bg-sec-light/20 flex size-9 cursor-pointer items-center justify-center rounded-lg transition-all sm:size-10"
                  :title="showImageGallery ? 'Hide images' : 'Show images'"
                >
                  <EyeIcon v-if="showImageGallery" class="text-acc size-4 sm:size-5" />
                  <EyeSlashIcon v-else class="size-4 sm:size-5" />
                </button>

                <!-- Save/Share Button -->
                <button
                  v-if="isAuthenticated && isEditing"
                  class="text-fg/60 hover:text-success hover:bg-sec-mute/30 dark:hover:bg-sec-light/20 flex size-9 cursor-pointer items-center justify-center rounded-lg transition-all sm:size-10"
                  title="Save edit"
                  @click="saveEdit(post.postId)"
                >
                  <CheckBadgeIcon class="text-success size-4 sm:size-5" />
                </button>

                <button
                  v-else
                  @click="handleShare"
                  class="text-fg/60 hover:text-acc hover:bg-sec-mute/30 dark:hover:bg-sec-light/20 flex size-9 cursor-pointer items-center justify-center rounded-lg transition-all sm:size-10"
                >
                  <ShareIcon class="text-acc size-4 sm:size-5" />
                </button>

                <!-- Close Button -->
                <button
                  @click="closeModal"
                  class="text-fg/40 hover:text-fg/80 hover:bg-sec-mute/30 dark:hover:bg-sec-light/20 flex size-9 cursor-pointer items-center justify-center rounded-lg transition-all sm:size-10"
                >
                  <XMarkIcon class="size-4 sm:size-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Gallery Section -->
          <Transition name="gallery" mode="out-in">
            <div
              v-if="allImages.length > 0 && showImageGallery"
              class="border-brdr/30 dark:border-sec-mute/30 border-b"
            >
              <!-- Main Image Display -->
              <div class="relative bg-black/5">
                <img
                  v-if="allImages[currentImageIndex]"
                  :src="allImages[currentImageIndex]"
                  :alt="`${post.postTitle || 'Post'} image ${currentImageIndex + 1}`"
                  class="h-64 w-full object-contain sm:h-96"
                />
                <div v-else class="flex h-64 items-center justify-center sm:h-80">
                  <PhotoIcon class="text-fg/30 size-16" />
                </div>

                <!-- Navigation Arrows -->
                <div
                  v-if="allImages.length > 1"
                  class="absolute inset-y-0 left-0 flex items-center"
                >
                  <button
                    @click="prevImage"
                    :disabled="currentImageIndex === 0"
                    class="hover:text-acc ml-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-4 sm:size-10"
                  >
                    <ChevronLeftIcon class="size-4 sm:size-5" />
                  </button>
                </div>

                <div
                  v-if="allImages.length > 1"
                  class="absolute inset-y-0 right-0 flex items-center"
                >
                  <button
                    @click="nextImage"
                    :disabled="currentImageIndex === allImages.length - 1"
                    class="hover:text-acc mr-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50 sm:mr-4 sm:size-10"
                  >
                    <ChevronRightIcon class="size-4 sm:size-5" />
                  </button>
                </div>

                <!-- Image Counter -->
                <div
                  v-if="allImages.length > 1"
                  class="absolute right-2 bottom-2 sm:right-4 sm:bottom-4"
                >
                  <span
                    class="rounded-full bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm sm:px-3 sm:text-sm"
                  >
                    {{ currentImageIndex + 1 }} / {{ allImages.length }}
                  </span>
                </div>
              </div>

              <!-- Thumbnail Navigation -->
              <div
                v-if="allImages.length > 1"
                class="border-brdr/30 dark:border-sec-mute/30 border-t"
              >
                <div
                  class="scrollbar-hide flex space-x-2 overflow-x-auto p-4"
                  style="scroll-behavior: smooth"
                >
                  <button
                    v-for="(image, index) in allImages"
                    :key="index"
                    @click="setCurrentImage(index)"
                    :class="[
                      'relative size-12 flex-shrink-0 rounded-lg border-2 transition-all duration-200 ease-out sm:size-14',
                      currentImageIndex === index
                        ? 'border-acc scale-105 shadow-lg'
                        : 'border-brdr/30 dark:border-sec-mute/30 hover:border-acc/50',
                    ]"
                  >
                    <img
                      :src="image"
                      :alt="`Thumbnail ${index + 1}`"
                      class="h-full w-full rounded-md object-cover"
                    />
                    <div
                      v-if="currentImageIndex === index"
                      class="bg-acc/20 absolute inset-0 rounded-md"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Content Section -->
          <div class="custom-scrollbar flex-1 overflow-y-auto">
            <div class="p-4 sm:p-6">
              <!-- Editing Mode -->
              <div v-if="isAuthenticated && isEditing" class="relative">
                <div
                  class="border-brdr/30 dark:border-sec-mute/30 dark:bg-sec/50 rounded-xl border bg-transparent"
                >
                  <div
                    class="border-brdr/30 dark:border-sec-mute/30 flex items-center gap-2 border-b px-4 py-3"
                  >
                    <PencilIcon class="text-acc size-4" />
                    <span class="text-fg text-sm font-medium">Editing Content</span>
                  </div>
                  <textarea
                    name="message"
                    id="editing-message"
                    class="text-fg placeholder-fg/50 focus:ring-acc/30 w-full resize-none border-0 bg-transparent p-4 text-sm leading-relaxed focus:ring-2 focus:outline-none sm:text-base"
                    rows="12"
                    placeholder="Share your story, describe the craftsmanship, or explain what makes this piece special. The more details you provide, the better others can appreciate your work."
                    v-model="editForm.postBody"
                  />
                </div>
              </div>

              <!-- Reading Mode -->
              <div v-else>
                <div
                  v-if="post.postBody"
                  class="border-brdr/30 dark:border-sec-mute/30 dark:bg-sec/50 rounded-xl border bg-transparent"
                >
                  <div
                    class="border-brdr/30 dark:border-sec-mute/30 flex items-center gap-2 border-b px-4 py-3"
                  >
                    <span class="text-fg text-sm font-medium">Post Content</span>
                  </div>
                  <div class="p-4">
                    <div
                      class="text-fg space-y-4 text-sm leading-relaxed break-words whitespace-pre-line sm:text-base"
                    >
                      {{ post.postBody }}
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-else
                  class="border-brdr/30 dark:border-sec-mute/30 rounded-xl border border-dashed"
                >
                  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div class="bg-acc/10 text-acc mb-4 rounded-full p-4">
                      <PencilIcon class="size-8" />
                    </div>
                    <h3 class="text-fg text-lg font-medium">No content available</h3>
                    <p class="text-fg/60 mt-2 text-sm">This post hasn't been given content yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-brdr/30 dark:border-sec-mute/30 border-t px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <span
                  v-if="allImages.length > 0"
                  class="text-fg-mute flex items-center gap-2 text-sm"
                >
                  <PhotoIcon class="size-4" />
                  <span
                    >{{ allImages.length }} {{ allImages.length === 1 ? 'image' : 'images' }}</span
                  >
                </span>
              </div>
              <span v-if="post.date" class="text-fg-mute flex items-center gap-2 text-sm">
                <CalendarIcon class="size-4" />
                <span>{{ post.date }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Gallery collapse transition */
.gallery-enter-active,
.gallery-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.gallery-enter-from,
.gallery-leave-to {
  max-height: 0;
  opacity: 0;
}

.gallery-enter-to,
.gallery-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* Backdrop transitions */
.backdrop-enter-active {
  transition: opacity 0.2s ease-out;
}

.backdrop-leave-active {
  transition: opacity 0.15s ease-in;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Modal transitions */
.modal-enter-active {
  transition: all 0.3s ease-out;
}

.modal-leave-active {
  transition: all 0.2s ease-in;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
