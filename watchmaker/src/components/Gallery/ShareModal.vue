<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { XMarkIcon, ClipboardIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'
import { useToastStore } from '@/stores/toast'
import IconMessenger from '../icons/IconMessenger.vue'
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  post: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const emit = defineEmits(['close'])

const toast = useToastStore()

const postUrl = computed(() => {
  if (!props.post?.postId) return ''
  return `${window.location.origin}/my-work/${props.post.postId}`
})

const shareTitle = computed(() => {
  return props.post?.postTitle || 'Check out this amazing workshop piece!'
})

const shareDescription = computed(() => {
  const body = props.post?.postBody || 'The latest piece of craftsmanship from my workshop.'
  return body.length > 100 ? body.substring(0, 100) + '...' : body
})

const twitterContent = computed(() => {
  const title = shareTitle.value
  const hashtags = '#Craftsmanship #Workshop #Handmade'
  return `${title} ${hashtags}`
})

const whatsappMessage = computed(() => {
  return `Check out this amazing workshop piece: "${shareTitle.value}"`
})

const messengerMessage = computed(() => {
  return `Check out my latest workshop piece: "${shareTitle.value}"`
})

const emailSubject = computed(() => {
  return `Amazing Workshop Piece: ${shareTitle.value}`
})

const emailBody = computed(() => {
  return `Hi!\n\nI wanted to share this beautiful piece with you:\n\n"${shareTitle.value}"\n\n${shareDescription.value}\n\nTake a look here:`
})

const facebookUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl.value)}&quote=${encodeURIComponent(shareTitle.value)}`
})

const messengerUrl = computed(() => {
  return `https://www.messenger.com/t/?link=${encodeURIComponent(postUrl.value)}&text=${encodeURIComponent(messengerMessage.value)}`
})

const twitterUrl = computed(() => {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl.value)}&text=${encodeURIComponent(twitterContent.value)}`
})

const whatsappUrl = computed(() => {
  return `https://wa.me/?text=${encodeURIComponent(whatsappMessage.value + ' ' + postUrl.value)}`
})

const emailUrl = computed(() => {
  return `mailto:?subject=${encodeURIComponent(emailSubject.value)}&body=${encodeURIComponent(emailBody.value + '\n\n' + postUrl.value)}`
})

const handleShare = (platform) => {
  console.log(`Sharing on ${platform}:`, {
    title: shareTitle.value,
    description: shareDescription.value,
    url: postUrl.value,
  })

  toast.showToast(`Opening ${platform} share...`, 'success')
}

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.show) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

const copyLink = async () => {
  if (!postUrl.value) {
    toast.showToast('No post to share', 'error')
    return
  }

  try {
    await navigator.clipboard.writeText(postUrl.value)
    toast.showToast('Link copied to clipboard!', 'success')
  } catch (error) {
    console.log(error)
    toast.showToast('Failed to copy link', 'error')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-[102] bg-black/60 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>
    </Transition>

    <Transition name="modal" appear>
      <div
        v-if="show && post?.postId"
        class="pointer-events-none fixed inset-0 z-[103] flex items-center justify-center p-4"
      >
        <div
          class="bg-primary/95 dark:border-sec-mute dark:bg-sec/95 pointer-events-auto relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl"
        >
          <div class="border-brdr/20 dark:border-sec-mute/30 border-b px-6 py-4">
            <div class="flex items-center justify-between">
              <h3 class="text-fg dark:text-fg2 text-lg font-semibold">Share Post</h3>
              <button
                @click="$emit('close')"
                class="text-fg/60 hover:bg-brdr/10 hover:text-fg rounded-lg p-1"
              >
                <XMarkIcon class="size-5" />
              </button>
            </div>
            <p class="text-fg/60 mt-1 text-sm">{{ post.postTitle || 'Untitled Post' }}</p>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="copyLink"
                class="border-brdr/20 bg-primary/50 hover:border-acc/30 hover:bg-acc/5 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
              >
                <ClipboardIcon class="text-acc size-6" />
                <span class="text-fg text-sm font-medium">Copy Link</span>
              </button>

              <a
                :href="facebookUrl"
                target="_blank"
                rel="noopener"
                @click="handleShare('Facebook')"
                class="border-brdr/20 bg-primary/50 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-blue-600 hover:bg-blue-50"
              >
                <svg class="size-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                <span class="text-fg text-sm font-medium">Facebook</span>
              </a>

              <a
                :href="twitterUrl"
                target="_blank"
                rel="noopener"
                @click="handleShare('Twitter')"
                class="border-brdr/20 bg-primary/50 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <svg class="size-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
                <span class="text-fg text-sm font-medium">Twitter</span>
              </a>

              <a
                :href="whatsappUrl"
                target="_blank"
                rel="noopener"
                @click="handleShare('WhatsApp')"
                class="border-brdr/20 bg-primary/50 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-green-500 hover:bg-green-50"
              >
                <svg class="size-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"
                  />
                </svg>
                <span class="text-fg text-sm font-medium">WhatsApp</span>
              </a>

              <a
                :href="messengerUrl"
                target="_blank"
                rel="noopener"
                @click="handleShare('Messenger')"
                class="border-brdr/20 bg-primary/50 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-blue-500 hover:bg-blue-50"
              >
                <IconMessenger class="size-6 text-blue-500" />
                <span class="text-fg text-sm font-medium">Messenger</span>
              </a>

              <a
                :href="emailUrl"
                @click="handleShare('Email')"
                class="border-brdr/20 bg-primary/50 dark:border-sec-mute/30 dark:bg-sec/50 flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                <EnvelopeIcon class="size-6 text-gray-600" />
                <span class="text-fg text-sm font-medium">Email</span>
              </a>
            </div>

            <div
              class="border-brdr/20 bg-brdr/5 dark:border-sec-mute/30 dark:bg-sec-mute/10 mt-4 rounded-lg border p-3"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-fg/60 truncate text-sm">{{ postUrl }}</span>
                <button
                  @click="copyLink"
                  class="text-fg/60 hover:bg-brdr/10 hover:text-fg rounded p-1"
                >
                  <ClipboardIcon class="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
