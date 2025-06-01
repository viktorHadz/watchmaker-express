<script setup>
import { ref, computed, watch } from 'vue'
import {
  XMarkIcon,
  CalendarIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
} from '@heroicons/vue/24/outline'

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

const currentImageIndex = ref(0)

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

const closeModal = () => {
  emit('close')
}

const handleShare = () => {
  // You can customize this - for now it copies the post title to clipboard
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`Check out this post: ${props.post.postTitle}`)
    // You could add a toast notification here
  }
  emit('share', props.post)
}

// Reset image index when post changes
watch(
  () => props.post.postId,
  () => {
    currentImageIndex.value = 0
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
    <!-- Backdrop with separate transition -->
    <Transition name="backdrop" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-[98] bg-black/60 backdrop-blur-sm"
        @click="closeModal"
      ></div>
    </Transition>

    <!-- Modal Content with separate transition -->
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="pointer-events-none fixed inset-0 z-[98] flex items-center justify-center sm:p-4"
      >
        <div
          class="dark:bg-sec/80 dark:border-sec-mute bg-primary pointer-events-auto relative flex h-full w-full max-w-4xl flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md sm:max-h-[90vh] sm:rounded-2xl"
        >
          <!-- Header -->
          <div
            class="dark:border-sec-mute dark:bg-sec/80 from-acc/10 via-acc/5 bg-primary sticky top-0 flex flex-col space-y-4 border-b border-white/10 bg-gradient-to-r to-transparent p-4 backdrop-blur-md sm:p-6"
          >
            <!-- Title and buttons row -->
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <h2 class="font-sec text-fg dark:text-fg2 text-xl font-semibold sm:text-2xl">
                  {{ post.postTitle }}
                </h2>
              </div>

              <div class="flex flex-shrink-0 items-center space-x-2">
                <button
                  @click="handleShare"
                  class="text-acc dark:bg-sec dark:hover:bg-sec-mute bg-acc/20 hover:bg-acc flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors hover:text-white sm:size-10"
                >
                  <ShareIcon class="size-4 sm:size-5" />
                </button>
                <button
                  @click="closeModal"
                  class="text-acc dark:bg-sec dark:hover:bg-sec-mute bg-acc/20 hover:bg-acc flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors hover:text-white sm:size-10"
                >
                  <XMarkIcon class="size-4 sm:size-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Image Gallery Section -->
            <div v-if="allImages.length > 0" class="relative">
              <!-- Main Image Display -->
              <div class="dark:bg-sec bg-primary relative">
                <img
                  v-if="allImages[currentImageIndex]"
                  :src="allImages[currentImageIndex]"
                  :alt="`${post.postTitle || 'Post'} image ${currentImageIndex + 1}`"
                  class="h-auto max-h-[50vh] w-full object-contain"
                />
                <div v-else class="flex h-64 items-center justify-center">
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
                    class="hover:text-acc ml-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeftIcon class="size-5" />
                  </button>
                </div>

                <div
                  v-if="allImages.length > 1"
                  class="absolute inset-y-0 right-0 flex items-center"
                >
                  <button
                    @click="nextImage"
                    :disabled="currentImageIndex === allImages.length - 1"
                    class="hover:text-acc mr-4 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRightIcon class="size-5" />
                  </button>
                </div>

                <!-- Image Counter -->
                <div v-if="allImages.length > 1" class="absolute right-4 bottom-4">
                  <span
                    class="rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm"
                  >
                    {{ currentImageIndex + 1 }} / {{ allImages.length }}
                  </span>
                </div>
              </div>
              <!-- Thumbnail Navigation -->
              <div
                v-if="allImages.length > 1"
                class="dark:border-sec-mute border-b border-white/10 p-4"
              >
                <div class="scrollbar-hide flex space-x-3 overflow-x-auto px-2 py-1">
                  <button
                    v-for="(image, index) in allImages"
                    :key="index"
                    @click="setCurrentImage(index)"
                    :class="[
                      'relative size-16 flex-shrink-0 rounded-lg border-2 transition-all',
                      currentImageIndex === index
                        ? 'border-acc scale-110 shadow-lg'
                        : 'hover:border-acc/50 dark:border-sec-light border-white/20',
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

            <!-- Post Content -->
            <div class="p-4 sm:p-6">
              <div v-if="post.postBody" class="w-full max-w-full py-8 sm:max-w-none">
                <div class="text-fg leading-relaxed break-words whitespace-pre-wrap">
                  {{ post.postBody }}
                </div>
              </div>

              <div v-else class="py-8 text-center">
                <div
                  class="bg-acc/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl"
                >
                  <PhotoIcon class="text-acc size-8" />
                </div>
                <p class="text-fg/60">No description available for this post</p>
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div
            v-if="allImages.length > 0"
            class="dark:border-sec-mute dark:bg-sec/80 from-acc/10 via-acc/5 bg-primary sticky bottom-0 border-t border-white/10 bg-gradient-to-r to-transparent backdrop-blur-md"
          >
            <div class="text-fg flex items-center justify-between px-6 py-2 text-sm">
              <span class="flex items-center gap-2">
                <PhotoIcon class="text-fg size-4"></PhotoIcon>
                {{ allImages.length }}
                {{ allImages.length === 1 ? 'image' : 'images' }} total</span
              >
              <span v-if="post.date" class="flex items-center gap-2">
                <CalendarIcon class="text-fg size-4"> </CalendarIcon> {{ post.date }}</span
              >
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

/* Backdrop transitions - appears first, no scale */
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

/* Modal transitions - content only */
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
