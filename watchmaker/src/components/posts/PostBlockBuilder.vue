<script setup>
import { computed, nextTick, ref } from 'vue'
import { CloudArrowUpIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { onClickOutside } from '@vueuse/core'
import ParagraphBlockEditor from '@/components/posts/ParagraphBlockEditor.vue'
import { useImageCompression } from '@/composables/useImageCompression'
import { useToastStore } from '@/stores/toast'
import {
  createHeadingBlock,
  createImageBlock,
  createParagraphBlock,
  GALLERY_BLOCK_COUNTS,
  getAssetPreviewSrc,
  getBlockLabel,
  resizeGalleryBlock,
} from '@/utils/postBlocks'

const MAX_FILE_SIZE = 15 * 1024 * 1024
const MAX_COMPRESSED_SIZE_KB = 800
const MAX_THUMBNAIL_SIZE_KB = 50
const MAX_INLINE_ASSETS = 100
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  assets: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'update:assets'])

const { compressImage, compressToSize } = useImageCompression()
const toastStore = useToastStore()
const toast = (message, type = 'info') => toastStore.showToast(message, type)

const paragraphEditors = ref({})
const insertMenuOpen = ref(false)
const insertMenuRef = ref(null)
const dragTargets = ref({})
const processingTargets = ref({})

const blocks = computed(() => props.modelValue || [])
const availableAssets = computed(() =>
  (props.assets || []).map((asset, index) => ({
    ...asset,
    id: `${asset.id}`,
    label: asset.label || `Story image ${index + 1}`,
  })),
)

const createPreview = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const createAssetId = () =>
  (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}`
  ).replace(/[^a-zA-Z0-9_-]/g, '')

const setParagraphEditorRef = (blockId, instance) => {
  if (instance) {
    paragraphEditors.value[blockId] = instance
    return
  }

  delete paragraphEditors.value[blockId]
}

const emitBlocks = (nextBlocks) => {
  emit('update:modelValue', nextBlocks)
}

const emitAssets = (nextAssets) => {
  emit('update:assets', nextAssets)
}

const updateBlock = (blockId, updater) => {
  emitBlocks(
    blocks.value.map((block) => {
      if (block.id !== blockId) {
        return block
      }

      return updater({
        ...block,
        imageRefs: Array.isArray(block.imageRefs) ? [...block.imageRefs] : [],
      })
    }),
  )
}

const upsertAssets = (nextAssets) => {
  const assetMap = new Map(availableAssets.value.map((asset) => [`${asset.id}`, asset]))
  nextAssets.forEach((asset) => {
    assetMap.set(`${asset.id}`, asset)
  })
  emitAssets(Array.from(assetMap.values()))
}

const openInsertMenu = () => {
  if (props.disabled) {
    return
  }

  insertMenuOpen.value = true
}

const closeInsertMenu = () => {
  insertMenuOpen.value = false
}

const addBlock = async (factory) => {
  if (props.disabled) {
    return
  }

  insertMenuOpen.value = false
  await nextTick()
  emitBlocks([...blocks.value, factory()])
}

const moveBlock = (index, direction) => {
  const targetIndex = index + direction
  if (props.disabled || targetIndex < 0 || targetIndex >= blocks.value.length) {
    return
  }

  const nextBlocks = [...blocks.value]
  ;[nextBlocks[index], nextBlocks[targetIndex]] = [nextBlocks[targetIndex], nextBlocks[index]]
  emitBlocks(nextBlocks)
}

const removeBlock = (blockId) => {
  if (props.disabled) {
    return
  }

  emitBlocks(blocks.value.filter((block) => block.id !== blockId))
}

const updateHeading = (blockId, patch) => {
  updateBlock(blockId, (block) => ({
    ...block,
    ...patch,
  }))
}

const updateParagraph = (blockId, html) => {
  updateBlock(blockId, (block) => ({
    ...block,
    html,
  }))
}

const toggleParagraphBold = (blockId) => {
  paragraphEditors.value[blockId]?.toggleBold?.()
}

const updateImageRef = (blockId, slotIndex, value) => {
  updateBlock(blockId, (block) => {
    const imageRefs = [...(block.imageRefs || [])]
    imageRefs[slotIndex] = value

    return {
      ...block,
      imageRefs,
    }
  })
}

const clearImageRef = (blockId, slotIndex) => {
  updateImageRef(blockId, slotIndex, '')
}

const updateImageCaption = (blockId, caption) => {
  updateBlock(blockId, (block) => ({
    ...block,
    caption,
  }))
}

const updateGallerySize = (blockId, count) => {
  updateBlock(blockId, (block) => resizeGalleryBlock(block, count))
}

const getImagePreview = (imageRef) => getAssetPreviewSrc(imageRef, availableAssets.value)

const getImageGridClass = (block) => {
  if (block.layout === 'pair') {
    return 'grid gap-4 md:grid-cols-2'
  }

  if (block.layout === 'gallery') {
    if (block.imageRefs.length >= 6) {
      return 'grid gap-4 md:grid-cols-2 xl:grid-cols-3'
    }

    if (block.imageRefs.length === 3) {
      return 'grid gap-4 md:grid-cols-3'
    }

    return 'grid gap-4 md:grid-cols-2'
  }

  return 'grid gap-4'
}

const getImageHelperText = (layout) => {
  switch (layout) {
    case 'caption':
      return 'Upload one image directly into this block and add a caption beneath it.'
    case 'pair':
      return 'Upload two images for a balanced side-by-side composition.'
    case 'gallery':
      return 'Upload images one by one or in a batch.'
    default:
      return 'Upload one full-width image to create a visual break in the story.'
  }
}

const getBlockMenuOptions = () => [
  { id: 'title', label: 'Title', create: () => createHeadingBlock(2) },
  { id: 'paragraph', label: 'Paragraph', create: () => createParagraphBlock() },
  { id: 'full', label: 'Full Image', create: () => createImageBlock('full') },
  { id: 'pair', label: 'Two Images', create: () => createImageBlock('pair') },
  { id: 'caption', label: 'Image + Caption', create: () => createImageBlock('caption') },
  { id: 'gallery', label: 'Gallery Row', create: () => createImageBlock('gallery') },
]

const setDragState = (targetKey, value) => {
  dragTargets.value = {
    ...dragTargets.value,
    [targetKey]: value,
  }
}

const isDraggingTarget = (targetKey) => Boolean(dragTargets.value[targetKey])

const setProcessingState = (targetKey, value) => {
  processingTargets.value = {
    ...processingTargets.value,
    [targetKey]: value,
  }
}

const isProcessingTarget = (targetKey) => Boolean(processingTargets.value[targetKey])

const createFieldId = (blockId, suffix) => `post-block-${blockId}-${suffix}`
const createFieldName = (blockId, suffix) => `post_blocks[${blockId}][${suffix}]`
const createTargetKey = (blockId, slotIndex) => `${blockId}-${slotIndex}`

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
    toast('Images must be smaller than 15MB before compression.', 'error')
    return false
  }

  return true
}

const generateThumbnail = async (file) => {
  try {
    return await compressToSize(file, MAX_THUMBNAIL_SIZE_KB, {
      maxWidth: 150,
      initialQuality: 0.6,
      preserveFormat: false,
      aggressiveResize: true,
    })
  } catch {
    return await compressImage(file, 150, 0.5, {
      preserveFormat: false,
      aggressiveResize: true,
    })
  }
}

const createUploadedAsset = async (file, labelPrefix = 'Story image') => {
  const assetId = createAssetId()
  const compressed = await compressToSize(file, MAX_COMPRESSED_SIZE_KB, {
    maxWidth: 1920,
    initialQuality: 0.8,
    preserveFormat: false,
    aggressiveResize: true,
  })
  const thumbnail = await generateThumbnail(file)
  const [src, thumbnailSrc] = await Promise.all([
    createPreview(compressed),
    createPreview(thumbnail),
  ])
  const displayName = file.name?.replace(/\.[^/.]+$/, '') || labelPrefix

  return {
    id: assetId,
    src,
    thumbnailSrc,
    label: displayName,
    alt: displayName,
    file: compressed,
    thumbnailFile: thumbnail,
    isLocalUpload: true,
  }
}

const uploadFilesIntoSlots = async (block, targetIndices, files) => {
  if (props.disabled || !targetIndices.length || !files.length) {
    return
  }

  const remainingCapacity = Math.max(0, MAX_INLINE_ASSETS - availableAssets.value.length)
  const validFiles = Array.from(files)
    .filter(validateImageFile)
    .slice(0, Math.min(targetIndices.length, remainingCapacity))

  if (!validFiles.length) {
    if (remainingCapacity === 0) {
      toast('You have reached the maximum of 100 uploaded story images.', 'warning')
    }
    return
  }

  targetIndices.forEach((targetIndex) => {
    setProcessingState(createTargetKey(block.id, targetIndex), true)
  })

  try {
    const createdAssets = []
    const nextImageRefs = [...(block.imageRefs || [])]

    for (const [index, file] of validFiles.entries()) {
      const asset = await createUploadedAsset(
        file,
        `${getBlockLabel(block)} image ${targetIndices[index] + 1}`,
      )
      createdAssets.push(asset)
      nextImageRefs[targetIndices[index]] = asset.id
    }

    upsertAssets(createdAssets)
    updateBlock(block.id, (currentBlock) => ({
      ...currentBlock,
      imageRefs: nextImageRefs,
    }))
  } catch (error) {
    console.error('Error uploading story image:', error)
    toast('Failed to process one of the uploaded images. Please try again.', 'error')
  } finally {
    targetIndices.forEach((targetIndex) => {
      setProcessingState(createTargetKey(block.id, targetIndex), false)
      setDragState(createTargetKey(block.id, targetIndex), false)
    })
  }
}

const handleSlotInputChange = async (block, slotIndex, event) => {
  const files = Array.from(event.target.files || [])
  if (files.length) {
    await uploadFilesIntoSlots(block, [slotIndex], files)
    event.target.value = ''
  }
}

const handleSlotDrop = async (block, slotIndex, event) => {
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length) {
    await uploadFilesIntoSlots(block, [slotIndex], files)
  }
}

const getGalleryBatchTargetIndices = (block, fileCount) => {
  const emptyIndices = (block.imageRefs || [])
    .map((imageRef, index) => (!imageRef ? index : null))
    .filter((index) => index !== null)

  if (emptyIndices.length >= fileCount) {
    return emptyIndices.slice(0, fileCount)
  }

  return Array.from({ length: Math.min(fileCount, block.imageRefs.length) }, (_, index) => index)
}

const handleGalleryBatchUpload = async (block, files) => {
  const targetIndices = getGalleryBatchTargetIndices(block, files.length)
  await uploadFilesIntoSlots(block, targetIndices, files)
}

const handleGalleryBatchInputChange = async (block, event) => {
  const files = Array.from(event.target.files || [])
  if (files.length) {
    await handleGalleryBatchUpload(block, files)
    event.target.value = ''
  }
}

const handleGalleryDrop = async (block, event) => {
  setDragState(createTargetKey(block.id, 'gallery'), false)
  const files = Array.from(event.dataTransfer?.files || [])
  if (files.length) {
    await handleGalleryBatchUpload(block, files)
  }
}

onClickOutside(insertMenuRef, () => {
  if (insertMenuOpen.value) {
    closeInsertMenu()
  }
})
</script>

<template>
  <section class="space-y-8">
    <div v-if="blocks.length" class="space-y-8">
      <article v-for="(block, index) in blocks" :key="block.id" class="space-y-5 pt-8 first:pt-0">
        <div
          class="bg-acc/40 dark:bg-fg/40 mb-4 h-px w-full mask-x-from-60% mask-x-to-transparent mask-center"
        ></div>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-fg/92 dark:text-fg/96 text-base font-medium">
              {{ getBlockLabel(block) }}
            </p>
            <p class="text-fg/60 dark:text-fg/72 text-xs tracking-[0.14em] uppercase">
              Block {{ index + 1 }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="border-brdr text-fg/88 dark:text-fg hover:border-acc hover:text-acc rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors dark:border"
              :disabled="disabled || index === 0"
              @click="moveBlock(index, -1)"
            >
              Up
            </button>
            <button
              type="button"
              class="border-brdr text-fg/88 dark:text-fg hover:border-acc hover:text-acc rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors dark:border"
              :disabled="disabled || index === blocks.length - 1"
              @click="moveBlock(index, 1)"
            >
              Down
            </button>
            <button
              type="button"
              class="border-danger/35 text-danger hover:bg-danger/10 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              :disabled="disabled"
              @click="removeBlock(block.id)"
            >
              Remove
            </button>
          </div>
        </div>

        <div v-if="block.type === 'heading'" class="grid gap-4 md:grid-cols-[180px_1fr]">
          <label class="space-y-2">
            <span class="input-lbl">Title Style</span>
            <select
              :id="createFieldId(block.id, 'level')"
              :name="createFieldName(block.id, 'level')"
              class="input"
              :value="block.level"
              :disabled="disabled"
              @change="updateHeading(block.id, { level: Number($event.target.value) })"
            >
              <option :value="1">H1</option>
              <option :value="2">H2</option>
              <option :value="3">H3</option>
            </select>
          </label>

          <label class="space-y-2">
            <span class="input-lbl">Title Text</span>
            <input
              :id="createFieldId(block.id, 'text')"
              :name="createFieldName(block.id, 'text')"
              type="text"
              class="input"
              :value="block.text"
              :disabled="disabled"
              placeholder="Write the title for this section..."
              @input="updateHeading(block.id, { text: $event.target.value })"
            />
          </label>
        </div>

        <div v-else-if="block.type === 'paragraph'" class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-fg text-sm">Paragraph text</p>
            <button
              type="button"
              class="border-brdr text-fg/88 dark:text-fg/94 hover:border-acc hover:text-acc rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              :disabled="disabled"
              @click="toggleParagraphBold(block.id)"
            >
              Bold
            </button>
          </div>

          <ParagraphBlockEditor
            :ref="(instance) => setParagraphEditorRef(block.id, instance)"
            :editor-id="createFieldId(block.id, 'paragraph')"
            :model-value="block.html"
            :disabled="disabled"
            placeholder="Write the paragraph text here..."
            @update:model-value="updateParagraph(block.id, $event)"
          />
        </div>

        <div v-else-if="block.type === 'image'" class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-fg text-sm leading-relaxed">
              {{ getImageHelperText(block.layout) }}
            </p>

            <div v-if="block.layout === 'gallery'" class="flex flex-wrap gap-2">
              <label class="space-y-1">
                <span class="text-fg/60 dark:text-fg/72 text-xs tracking-[0.14em] uppercase"
                  >Gallery Size</span
                >
                <select
                  :id="createFieldId(block.id, 'gallery-count')"
                  :name="createFieldName(block.id, 'gallery_count')"
                  class="input min-w-28"
                  :value="block.imageRefs.length"
                  :disabled="disabled"
                  @change="updateGallerySize(block.id, Number($event.target.value))"
                >
                  <option v-for="count in GALLERY_BLOCK_COUNTS" :key="count" :value="count">
                    {{ count }} images
                  </option>
                </select>
              </label>

              <div class="flex items-end">
                <label
                  :for="createFieldId(block.id, 'gallery-upload')"
                  class="border-brdr text-fg/88 dark:text-fg/94 hover:border-acc hover:text-acc inline-flex cursor-pointer items-center rounded-lg border px-3 py-4 text-xs font-medium transition-colors"
                >
                  Upload Multiple
                </label>
                <input
                  :id="createFieldId(block.id, 'gallery-upload')"
                  :name="createFieldName(block.id, 'gallery_upload')"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  class="hidden"
                  :disabled="disabled"
                  @change="handleGalleryBatchInputChange(block, $event)"
                />
              </div>
            </div>
          </div>

          <div
            v-if="block.layout === 'gallery'"
            class="border-brdr bg-sec-light/30 dark:bg-sec/80 rounded-lg border border-dashed px-4 py-3"
            :class="{
              'border-acc bg-acc/5': isDraggingTarget(createTargetKey(block.id, 'gallery')),
            }"
            @dragover.prevent
            @dragenter.prevent="setDragState(createTargetKey(block.id, 'gallery'), true)"
            @dragleave.prevent="setDragState(createTargetKey(block.id, 'gallery'), false)"
            @drop.prevent="handleGalleryDrop(block, $event)"
          >
            <p class="text-fg/60 dark:text-fg/72 text-center text-sm">
              Drop multiple images here to fill the gallery in order.
            </p>
          </div>

          <div v-if="block.layout === 'caption'" class="space-y-2">
            <label class="space-y-2">
              <span class="input-lbl">Caption</span>
              <input
                :id="createFieldId(block.id, 'caption')"
                :name="createFieldName(block.id, 'caption')"
                type="text"
                class="input"
                :value="block.caption"
                :disabled="disabled"
                placeholder="Add a caption for the image..."
                @input="updateImageCaption(block.id, $event.target.value)"
              />
            </label>
          </div>

          <div :class="getImageGridClass(block)">
            <div
              v-for="(imageRef, slotIndex) in block.imageRefs"
              :key="`${block.id}-${slotIndex}`"
              class="space-y-3"
            >
              <div class="flex items-center justify-between gap-3">
                <label class="input-lbl" :for="createFieldId(block.id, `image-${slotIndex}`)">
                  Image {{ slotIndex + 1 }}
                </label>
                <button
                  v-if="imageRef"
                  type="button"
                  class="border-brdr text-fg/72 dark:text-fg/82 hover:border-acc hover:text-acc rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                  :disabled="disabled"
                  @click="clearImageRef(block.id, slotIndex)"
                >
                  Clear
                </button>
              </div>

              <div
                class="group border-brdr bg-sec-light/45 dark:bg-sec/55 relative overflow-hidden rounded-lg border transition-colors"
                :class="{
                  'border-acc bg-acc/5': isDraggingTarget(createTargetKey(block.id, slotIndex)),
                }"
                @dragover.prevent
                @dragenter.prevent="setDragState(createTargetKey(block.id, slotIndex), true)"
                @dragleave.prevent="setDragState(createTargetKey(block.id, slotIndex), false)"
                @drop.prevent="handleSlotDrop(block, slotIndex, $event)"
              >
                <input
                  :id="createFieldId(block.id, `image-${slotIndex}`)"
                  :name="createFieldName(block.id, `image_${slotIndex}`)"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  :disabled="disabled"
                  @change="handleSlotInputChange(block, slotIndex, $event)"
                />

                <label
                  :for="createFieldId(block.id, `image-${slotIndex}`)"
                  class="block cursor-pointer"
                >
                  <div
                    v-if="getImagePreview(imageRef)"
                    class="relative aspect-[4/3] overflow-hidden bg-black/5"
                  >
                    <img
                      :src="getImagePreview(imageRef)"
                      :alt="`Selected image ${slotIndex + 1}`"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div
                      class="absolute inset-0 flex items-end bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <div class="flex w-full items-center justify-between p-4">
                        <span class="text-sm font-medium text-white">Replace image</span>
                        <CloudArrowUpIcon class="size-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div
                    v-else
                    class="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center"
                  >
                    <div
                      class="bg-acc/10 text-acc flex size-14 items-center justify-center rounded-lg"
                    >
                      <CloudArrowUpIcon class="size-7" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-fg/92 dark:text-fg/96 font-medium">
                        {{
                          isProcessingTarget(createTargetKey(block.id, slotIndex))
                            ? 'Processing image...'
                            : 'Click or drop an image here'
                        }}
                      </p>
                      <p class="text-fg/60 dark:text-fg/72 text-sm">
                        JPEG, PNG, or WebP up to 15MB.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div ref="insertMenuRef" class="space-y-4">
      <Transition name="block-insert" mode="out-in">
        <button
          v-if="!insertMenuOpen"
          key="insert-button"
          type="button"
          class="border-brdr dark:border-brdr text-fg/90 dark:text-fg/90 hover:border-acc hover:text-acc bg-sec-light/20 dark:bg-sec/80 flex min-h-44 w-full items-center justify-center rounded-lg border-2 border-dashed transition-colors"
          :disabled="disabled"
          @click="openInsertMenu"
        >
          <span class="flex flex-col items-center gap-3">
            <span class="bg-acc/10 text-acc flex size-14 items-center justify-center rounded-lg">
              <PlusIcon class="size-8" />
            </span>
            <span class="text-base font-medium">
              {{ blocks.length ? 'Add another block' : 'Add your first block' }}
            </span>
          </span>
        </button>

        <div v-else key="insert-menu" class="bg-sec-light/70 dark:bg-sec/80 rounded-lg p-5">
          <div class="mb-4 space-y-1">
            <p class="text-acc tracking-[0.2em] uppercase">Choose Block</p>
            <p class="text-fg">
              Add the next piece of the story, then continue building from there.
            </p>
          </div>

          <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="option in getBlockMenuOptions()"
              :key="option.id"
              type="button"
              class="border-brdr text-fg hover:border-acc hover:text-acc hover:bg-acc/5 dark:hover:bg-acc/8 rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
              :disabled="disabled"
              @click="addBlock(option.create)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.block-insert-enter-active,
.block-insert-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.block-insert-enter-from,
.block-insert-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
