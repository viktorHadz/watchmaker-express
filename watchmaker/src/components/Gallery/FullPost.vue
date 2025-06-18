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

// Passed State
const { isAuthenticated } = useAuth()
const postsStore = usePostsStore()
const { isEditing, editForm } = storeToRefs(postsStore)
const { saveEdit } = postsStore

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

const handleShare = () => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(`Check out this post: ${props.post.postTitle}`)
  }
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
        class="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-2 sm:p-4"
      >
        <div
          class="dark:bg-sec/95 dark:border-sec-mute bg-primary/95 pointer-events-auto relative flex h-full w-full max-w-4xl flex-col overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl sm:max-h-[95vh] sm:rounded-2xl"
        >
          <!-- Sticky Header -->
          <div
            class="dark:border-brdr/30 dark:bg-sec/80 from-acc/5 via-primary/90 to-primary/90 border-brdr/20 sticky top-0 z-10 border-b bg-gradient-to-r backdrop-blur-md"
          >
            <div class="px-4 py-4 sm:px-6">
              <div class="items-center gap-4 space-y-2 sm:flex">
                <!-- Title Section -->
                <div class="min-w-0 flex-1">
                  <div v-if="isAuthenticated && isEditing">
                    <input
                      type="text"
                      id="editing-post-id"
                      class="input font-sec text-fg dark:text-fg2 focus:ring-acc/30 border-brdr/30 w-full rounded-lg text-lg font-light tracking-wide focus:ring-2 sm:text-xl"
                      placeholder="Post Title"
                      v-model="editForm.postTitle"
                    />
                  </div>
                  <div v-else>
                    <h2
                      class="font-sec text-fg dark:text-fg2 line-clamp-2 text-lg font-light tracking-wide sm:text-xl"
                    >
                      {{ post.postTitle }}
                    </h2>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-2">
                  <!-- Toggle Gallery Button -->
                  <button
                    v-if="allImages.length > 0"
                    @click="toggleImageGallery"
                    class="group relative size-9 sm:size-10"
                    :title="showImageGallery ? 'Hide images' : 'Show images'"
                  >
                    <div
                      :class="[
                        'absolute inset-0 rounded-xl bg-gradient-to-br transition-all duration-300',
                        showImageGallery
                          ? 'from-acc/20 to-acc/10 group-hover:from-acc/30 group-hover:to-acc/20'
                          : 'from-gray-500/20 to-gray-500/10 group-hover:from-gray-500/30 group-hover:to-gray-500/20',
                      ]"
                    ></div>
                    <div
                      :class="[
                        'relative flex h-full w-full items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300',
                        showImageGallery
                          ? 'border-acc/30 group-hover:border-acc/50 bg-primary/50 dark:bg-sec/50'
                          : 'bg-primary/50 dark:bg-sec/50 border-gray-500/30 group-hover:border-gray-500/50',
                      ]"
                    >
                      <EyeIcon
                        v-if="showImageGallery"
                        class="text-acc size-4 transition-all duration-300"
                      />
                      <EyeSlashIcon
                        v-else
                        class="size-4 text-gray-500 transition-all duration-300"
                      />
                    </div>
                  </button>

                  <!-- Save/Share Button -->
                  <button
                    v-if="isAuthenticated && isEditing"
                    class="group relative size-9 sm:size-10"
                    @click="saveEdit(post.postId)"
                  >
                    <div
                      class="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 transition-all duration-300 group-hover:from-green-500/30 group-hover:to-green-500/20"
                    ></div>
                    <div
                      class="bg-primary/50 dark:bg-sec/50 relative flex h-full w-full items-center justify-center rounded-xl border border-green-500/30 backdrop-blur-sm transition-all duration-300 group-hover:border-green-500/50"
                    >
                      <CheckBadgeIcon
                        class="size-4 text-green-500 transition-transform group-hover:scale-110"
                      />
                    </div>
                  </button>

                  <button v-else @click="handleShare" class="group relative size-9 sm:size-10">
                    <div
                      class="from-acc/20 to-acc/10 group-hover:from-acc/30 group-hover:to-acc/20 absolute inset-0 rounded-xl bg-gradient-to-br transition-all duration-300"
                    ></div>
                    <div
                      class="border-acc/30 bg-primary/50 dark:bg-sec/50 group-hover:border-acc/50 relative flex h-full w-full items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300"
                    >
                      <ShareIcon
                        class="text-acc size-4 transition-transform group-hover:scale-110"
                      />
                    </div>
                  </button>

                  <!-- Close Button -->
                  <button @click="closeModal" class="group relative size-9 sm:size-10">
                    <div
                      class="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 transition-all duration-300 group-hover:from-red-500/30 group-hover:to-red-500/20"
                    ></div>
                    <div
                      class="bg-primary/50 dark:bg-sec/50 relative flex h-full w-full items-center justify-center rounded-xl border border-red-500/30 backdrop-blur-sm transition-all duration-300 group-hover:border-red-500/50"
                    >
                      <XMarkIcon
                        class="size-4 text-red-500 transition-all duration-300 group-hover:rotate-90"
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Collapsible Image Gallery Section -->
          <Transition name="gallery" mode="out-in">
            <div
              v-if="allImages.length > 0 && showImageGallery"
              class="border-brdr/20 dark:border-sec-mute/30 border-b"
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
                class="border-brdr/20 dark:border-sec-mute/30 border-t"
              >
                <div class="scrollbar-hide flex space-x-2 overflow-x-auto p-4 sm:p-4">
                  <button
                    v-for="(image, index) in allImages"
                    :key="index"
                    @click="setCurrentImage(index)"
                    :class="[
                      'relative size-12 flex-shrink-0 rounded-lg border-2 transition-all sm:size-14',
                      currentImageIndex === index
                        ? 'border-acc scale-105 shadow-lg'
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
          </Transition>

          <!-- Scrollable Content Area -->
          <div class="custom-scrollbar flex-1 overflow-y-auto">
            <div class="p-2 sm:p-6">
              <!-- Editing Mode -->
              <div v-if="isAuthenticated && isEditing" class="relative">
                <textarea
                  name="message"
                  id="editing-message"
                  class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc input custom-scrollbar min-h-96 w-full resize-none overflow-y-auto rounded-xl p-4 pr-12 text-sm leading-relaxed sm:text-base"
                  placeholder="Share your story, describe the craftsmanship, or explain what makes this piece special. The more details you provide, the better others can appreciate your work."
                  v-model="editForm.postBody"
                />
                <!-- Pencil icon positioned inside -->
                <div class="pointer-events-none absolute top-4 right-4">
                  <PencilIcon class="text-acc/60 size-4 animate-pulse sm:size-5"></PencilIcon>
                </div>
              </div>

              <!-- Reading Mode -->
              <div v-else>
                <div v-if="post.postBody">
                  <div
                    class="bg-primary/20 dark:bg-sec border-brdr/20 dark:border-sec-mute/30 border p-4 sm:rounded-xl sm:p-4"
                  >
                    <div class="text-fg space-y-4 text-sm leading-relaxed break-words sm:text-base">
                      <!-- Remove the paragraph splitting and just display the whole content -->
                      <div class="text-fg leading-relaxed whitespace-pre-line">
                        {{ post.postBody }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="flex items-center justify-center py-2">
                  <div
                    class="dark:border-acc/50 border-acc bg-acc/5 flex max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center sm:px-8 sm:py-16"
                  >
                    <p class="text-fg text-lg font-medium tracking-wide sm:text-xl">
                      No description available
                    </p>
                    <p class="text-fg/60 mt-2 text-xs sm:text-sm">
                      This post hasn't been given a description yet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fixed Footer -->
          <div
            class="dark:border-brdr/30 dark:bg-sec/80 border-brdr/20 bg-primary/80 border-t backdrop-blur-md"
          >
            <div class="flex items-center justify-between px-4 py-3 sm:px-6">
              <span
                v-if="allImages.length > 0"
                class="text-fg-mute flex items-center gap-2 text-xs font-light sm:text-sm"
              >
                <PhotoIcon class="size-3 sm:size-4"></PhotoIcon>
                <span
                  >{{ allImages.length }} {{ allImages.length === 1 ? 'image' : 'images' }}</span
                >
              </span>
              <span
                v-if="post.date"
                class="text-fg-mute flex items-center gap-2 text-xs font-light sm:text-sm"
              >
                <CalendarIcon class="size-3 sm:size-4"></CalendarIcon>
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
