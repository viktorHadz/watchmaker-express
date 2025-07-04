<script setup>
import { reactive, ref, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import { zodFormSchema } from '@/composables/formZodSchema'
import { PaperAirplaneIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import IconGallery from './icons/IconGallery.vue'
import IconPlusGallery from './icons/IconPlusGallery.vue'
import { useDropZone } from '@vueuse/core'
import { useFileSize } from '@/composables/usefmtFileSize.js'

const toast = useToastStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
})
const uploadedImages = ref([])

const fieldStates = reactive({
  firstName: { touched: false, focused: false },
  lastName: { touched: false, focused: false },
  email: { touched: false, focused: false },
  phone: { touched: false, focused: false },
  message: { touched: false, focused: false },
})
const displayErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  message: '',
  phone: '',
})
// Validate individual field
const validateField = (fieldName, value) => {
  try {
    const fieldSchema = zodFormSchema.shape[fieldName]
    fieldSchema.parse(value)
    displayErrors[fieldName] = ''
    return true
  } catch (error) {
    const errorMessage = error.errors?.[0]?.message || 'Invalid input'
    displayErrors[fieldName] = errorMessage
    return false
  }
}
// Handle field focus
const handleFocus = (fieldName) => {
  fieldStates[fieldName].focused = true
}

// Handle field blur
const handleBlur = (fieldName) => {
  fieldStates[fieldName].focused = false
  fieldStates[fieldName].touched = true

  // Validate on blur if field has been touched
  if (fieldStates[fieldName].touched) {
    validateField(fieldName, form[fieldName])
  }
}

// Debounced validation function
let validationTimeouts = {}
const debounceValidation = (fieldName, value, delay = 300) => {
  clearTimeout(validationTimeouts[fieldName])
  validationTimeouts[fieldName] = setTimeout(() => {
    if (fieldStates[fieldName].touched) {
      validateField(fieldName, value)
    }
  }, delay)
}

// Size formatter
const { formatFileSize, toMB } = useFileSize()
// Watch form fields for changes
Object.keys(displayErrors).forEach((fieldName) => {
  watch(
    () => form[fieldName],
    (newVal) => debounceValidation(fieldName, newVal),
  )
})

// Function activated on click
const onSubmit = async () => {
  // Mark all fields as touched on submit
  Object.keys(fieldStates).forEach((field) => {
    fieldStates[field].touched = true
  })

  const result = zodFormSchema.safeParse(form)

  if (!result.success) {
    const formattedError = result.error.format()
    displayErrors.firstName = formattedError.firstName?._errors[0] || ''
    displayErrors.lastName = formattedError.lastName?._errors[0] || ''
    displayErrors.email = formattedError.email?._errors[0] || ''
    displayErrors.message = formattedError.message?._errors[0] || ''
    displayErrors.phone = formattedError.phone?._errors[0] || ''

    toast.showToast('Please fix the errors.', 'error')
    return
  }
  // Adding images to form - PROBLEMATIC !!! - I NEED TO USE THE FILES OBJECT
  // I destructure data and attach images to it
  result.data = { ...result.data, images: uploadedImages.value }
  console.log('Form submitted:', result.data)

  // send validated form and images
  const success = await postData(result.data)

  // If server responded successfully
  if (success) {
    clearForm()
    toast.showToast('Your message was sent successfully!', 'success')
  }
}
// Sends the data to the backend
const postData = async (formData) => {
  try {
    const res = await fetch('/api/form/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After')
      const remaining = Math.round(retryAfter / 60)
      console.log('Rate limited. Retry-After:', retryAfter)
      toast.showToast(`Too many submissions! Try again in ${remaining} minutes.`, 'error')
      return false
    }

    const result = await res.json()

    if (!res.ok) {
      toast.showToast(result.message || 'Submission failed', 'error')
      return false
    }
    return true
  } catch (error) {
    console.error('Submission error:', error)
    toast.showToast('Submission failed. Please try again later.', 'error')
    return false
  }
}
// Centralized file processing function
const processFiles = async (files) => {
  if (!files?.length) {
    toast.showToast('No files selected.', 'error')
    return false
  }

  // Check limit before processing
  const remainingSlots = 5 - uploadedImages.value.length
  if (files.length > remainingSlots) {
    toast.showToast(
      `You can only add ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}.`,
      'error',
    )
    return false
  }

  // Validate files
  const errors = validateFiles(files)
  if (errors.length) {
    toast.showToast(errors.join('; '), 'error')
    return false
  }

  // Converts all files to base64 immediately
  try {
    const base64Files = await Promise.all(
      files.map(async (file, index) => {
        console.log(`Processing file ${index + 1}:`, file.name, file.type, file.size)
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
          id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`, // More unique ID
        }
      }),
    )

    console.log(`Successfully processed ${base64Files.length} files`)
    uploadedImages.value.push(...base64Files)
    return true
  } catch (error) {
    console.error('Error processing images:', error)
    toast.showToast('Error processing images. Please try again.', 'error')
    return false
  }
}

// File input handler
const handleFileChange = async (ev) => {
  const files = Array.from(ev.target.files || [])
  console.log('File input changed:', files.length, 'files')

  await processFiles(files)

  // Always clear the input to allow re-selecting the same files
  ev.target.value = ''
}

/* HELPERS  */
// Validate files (fixed to be more permissive)
const validateFiles = (files) => {
  const maxSize = 7 * 1000 * 1000 // 7MB in decimal
  const errors = []
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  for (const file of files) {
    if (!validTypes.includes(file.type.toLowerCase())) {
      errors.push(`${file.name} is not a supported image format (${file.type})`)
    }
    if (file.size > maxSize) {
      const fileSizeMB = toMB(file.size)
      errors.push(`${file.name} is too large (${fileSizeMB}MB, max 7MB per file)`)
    }
    if (file.size === 0) {
      errors.push(`${file.name} appears to be empty`)
    }
  }
  return errors
}
// Convert file to base64 for preview AND email sending
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Dropzone setup
const dropZoneRef = ref()
const onDrop = async (files) => {
  console.log('Files dropped:', files?.length)
  if (files) {
    await processFiles(Array.from(files))
  }
}
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,
  // Only accept image files
  dataTypes: ['image/jpeg', 'image/png', 'image/webp'],
})

const removeImage = (index) => {
  console.log('Removing image at index:', index)
  uploadedImages.value.splice(index, 1)
}

// Update clearForm to include images
const clearForm = () => {
  Object.keys(form).forEach((key) => {
    form[key] = ''
  })

  Object.keys(fieldStates).forEach((key) => {
    fieldStates[key].touched = false
    fieldStates[key].focused = false
  })

  Object.keys(displayErrors).forEach((key) => {
    displayErrors[key] = ''
  })

  uploadedImages.value = []
  console.log('Form and images cleared')
}
</script>

<template>
  <form action="#" method="POST" class="p-4 md:p-8">
    <div class="space-y-8">
      <!-- Name Row -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="group">
          <div class="mb-2 flex items-baseline">
            <label for="first-name" class="font-sec text-fg font-medium">First name</label>
            <span class="ml-1 text-red-500">*</span>
          </div>
          <div class="relative">
            <input
              type="text"
              name="first-name"
              id="first-name"
              maxlength="50"
              autocomplete="given-name"
              class="input"
              placeholder="Enter your first name"
              v-model="form.firstName"
              @focus="handleFocus('firstName')"
              @blur="handleBlur('firstName')"
            />
            <Transition>
              <div
                v-if="displayErrors.firstName && fieldStates.firstName.touched"
                class="absolute mt-1 text-sm text-red-500 dark:text-red-400"
              >
                {{ displayErrors.firstName }}
              </div>
            </Transition>
          </div>
        </div>

        <div class="group">
          <div class="mb-2 flex items-baseline">
            <label for="last-name" class="font-sec text-fg font-medium">Last name</label>
            <span class="ml-1 text-red-500">*</span>
          </div>
          <div class="relative">
            <input
              type="text"
              name="last-name"
              id="last-name"
              maxlength="50"
              autocomplete="family-name"
              class="input"
              placeholder="Enter your last name"
              v-model="form.lastName"
              @focus="handleFocus('lastName')"
              @blur="handleBlur('lastName')"
            />
            <Transition>
              <div
                v-if="displayErrors.lastName && fieldStates.lastName.touched"
                class="absolute mt-1 text-sm text-red-500 dark:text-red-400"
              >
                {{ displayErrors.lastName }}
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="group">
        <div class="mb-2 flex items-baseline">
          <label for="email" class="font-sec text-fg font-medium">Email address</label>
          <span class="ml-1 text-red-500">*</span>
        </div>
        <div class="relative">
          <input
            type="email"
            name="email"
            id="email"
            maxlength="254"
            autocomplete="email"
            class="input"
            placeholder="your.email@example.com"
            v-model="form.email"
            @focus="handleFocus('email')"
            @blur="handleBlur('email')"
          />
          <Transition>
            <div
              v-if="displayErrors.email && fieldStates.email.touched"
              class="absolute mt-1 text-sm text-red-500 dark:text-red-400"
            >
              {{ displayErrors.email }}
            </div>
          </Transition>
        </div>
      </div>

      <!-- Phone -->
      <div class="group">
        <label for="phone-number" class="font-sec text-fg mb-2 block font-medium"
          >Phone number</label
        >
        <div class="relative">
          <input
            type="tel"
            name="phone-number"
            id="phone-number"
            maxlength="25"
            autocomplete="tel"
            class="input"
            placeholder="+44 123 456 7890"
            v-model="form.phone"
            @focus="handleFocus('phone')"
            @blur="handleBlur('phone')"
          />
          <Transition>
            <div
              v-if="displayErrors.phone && fieldStates.phone.touched"
              class="absolute mt-1 text-sm text-red-500 dark:text-red-400"
            >
              {{ displayErrors.phone }}
            </div>
          </Transition>
        </div>
      </div>

      <!-- File Upload with Dropzone -->
      <div>
        <div class="mb-4 flex items-center justify-between">
          <label for="file-upload" class="font-sec text-fg font-medium"> Watch Images </label>

          <div class="lg flex items-center gap-3">
            <label
              for="file-upload"
              :class="[
                'inline-flex items-center rounded-lg px-3 py-2 font-medium transition-all duration-200 sm:px-4 sm:py-2',
                uploadedImages.length < 5
                  ? 'bg-acc/10 text-acc hover:bg-acc/20 cursor-pointer hover:scale-[1.02]'
                  : 'bg-success/10 text-fg cursor-not-allowed',
              ]"
            >
              <IconPlusGallery class="mr-2 size-4" />
              <span class="font-sec leading-0 font-semibold"> Add</span>
            </label>
          </div>
        </div>

        <input
          type="file"
          name="images"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          class="hidden"
          id="file-upload"
          :disabled="uploadedImages.length >= 5"
          @change="handleFileChange"
        />

        <!-- Dropzone Area -->
        <div
          ref="dropZoneRef"
          :class="[
            'group relative rounded-lg border-2 border-dashed transition-all duration-200',
            isOverDropZone
              ? 'border-acc bg-acc/10 scale-[1.02]'
              : uploadedImages.length < 5
                ? 'border-acc/30 bg-acc/5 hover:border-acc/50 hover:bg-acc/10 cursor-pointer'
                : 'border-acc/20 dark:bg-sec bg-sec-light cursor-not-allowed',
          ]"
          @click="uploadedImages.length < 5 && $refs.fileInput?.click()"
        >
          <!-- Input for dropzone -->
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            class="hidden"
            :disabled="uploadedImages.length >= 5"
            @change="handleFileChange"
          />

          <div v-if="uploadedImages.length > 0" class="p-4">
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <div
                v-for="(image, index) in uploadedImages"
                :key="image.id"
                class="bg-sec/80 border-acc/20 group hover:border-acc/40 relative flex flex-col overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md"
              >
                <!-- Image Preview -->
                <div class="relative mb-2 overflow-hidden">
                  <img
                    :src="image.data"
                    :alt="`Preview of ${image.name}`"
                    class="h-20 w-full object-cover transition-transform duration-200 group-hover:scale-105 sm:h-24"
                    loading="lazy"
                  />

                  <!-- Remove button -->
                  <button
                    @click.stop="removeImage(index)"
                    class="bg-danger hover:bg-danger/90 focus:ring-danger/50 pointer-events-auto absolute top-1 right-1 z-10 cursor-pointer rounded-full p-1.5 text-white opacity-100 shadow-md transition-all duration-200 hover:scale-110 focus:opacity-100 focus:ring-2 focus:outline-none xl:opacity-0 xl:group-hover:opacity-100"
                    type="button"
                    :aria-label="`Remove ${image.name}`"
                  >
                    <XMarkIcon class="size-3" />
                  </button>
                </div>

                <!-- File Info -->
                <div class="flex flex-col justify-between gap-1 justify-self-end">
                  <span
                    class="text-fg line-clamp-2 px-1 text-center text-xs font-medium"
                    :title="image.name"
                  >
                    {{ image.name }}
                  </span>
                  <span class="text-fg-subtle text-center text-xs">
                    {{ formatFileSize(image.size) }}
                  </span>
                </div>
              </div>

              <!-- Add More Card (if under limit) -->
              <div
                v-if="uploadedImages.length < 5"
                class="bg-acc/5 border-acc/30 hover:bg-acc/10 hover:border-acc/50 pointer-events-auto flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-[1.02]"
                @click.stop="$refs.fileInput?.click()"
              >
                <PlusIcon class="text-acc mb-1 size-6" />
                <span class="text-acc text-xs font-medium">Add More</span>
                <span class="text-fg-subtle text-xs">{{ 5 - uploadedImages.length }} left</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center p-8 text-center">
            <!-- Drag & Drop Indicator -->
            <div v-if="isOverDropZone" class="text-acc flex flex-col items-center">
              <IconGallery class="mb-3 size-16 animate-bounce" />
              <p class="text-lg font-semibold">Drop your images here!</p>
              <p class="text-sm opacity-80">Release to upload</p>
            </div>

            <!-- Default State -->
            <div v-else class="flex flex-col items-center">
              <IconGallery class="text-acc mb-3 size-12" />
              <p class="text-fg mb-2 font-medium">Drag & drop images here</p>
              <p class="text-fg-subtle mb-3 text-sm">or click to browse files</p>
              <div class="bg-acc/10 text-acc rounded-lg px-4 py-2 text-sm font-medium">
                Choose up to 5 images
              </div>
              <p class="text-fg-subtle mt-2 text-xs">JPEG, PNG, WebP • Max 10MB each</p>
            </div>
          </div>
        </div>

        <div class="flex w-full justify-end px-2 py-3">
          <!--Progress bar -->
          <div class="flex items-center gap-3" v-if="uploadedImages.length > 0">
            <div
              class="bg-sec relative h-4 w-16 overflow-hidden rounded-full border"
              :class="[
                uploadedImages.length < 5
                  ? 'drop-shadow-acc/50 border-acc drop-shadow-sm'
                  : 'drop-shadow-success/50 border-success drop-shadow-sm',
              ]"
            >
              <div
                class="h-full transition-all duration-500 ease-out"
                :class="[uploadedImages.length < 5 ? 'bg-acc' : 'bg-success']"
                :style="{ width: `${(uploadedImages.length / 5) * 100}%` }"
              ></div>
            </div>

            <!-- Status indicator -->
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'font-medium',
                  uploadedImages.length === 5 ? 'text-success' : 'text-fg-subtle',
                ]"
              >
                {{ uploadedImages.length }}/5
              </span>

              <!-- Full indicator -->
              <div
                v-if="uploadedImages.length === 5"
                class="bg-success text-fg2 drop-shadow-success flex items-center rounded-full px-2.5 py-2 leading-0 font-semibold drop-shadow-sm"
              >
                <span class="text-lg leading-1">✓ </span> Done
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message -->
      <div>
        <div class="mb-2 flex items-baseline">
          <label for="message" class="font-sec text-fg font-medium">Message</label>
          <span class="ml-1 text-red-500">*</span>
        </div>
        <div class="relative">
          <textarea
            name="message"
            id="message"
            maxlength="1000"
            rows="8"
            class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc input custom-scrollbar w-full resize-none rounded-xl"
            placeholder="Tell me about your watch, what issues you're experiencing, or any specific requirements..."
            v-model="form.message"
            @focus="handleFocus('message')"
            @blur="handleBlur('message')"
          />
          <Transition>
            <div
              v-if="displayErrors.message && fieldStates.message.touched"
              class="absolute mt-1 text-sm text-red-500 dark:text-red-400"
            >
              {{ displayErrors.message }}
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="border-brdr/10 mt-8 border-t pt-6">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="dark:text-acc/60 text-acc/80 text-sm">
          Fields marked with <span class="text-lg text-red-500">*</span> are required
        </p>
        <button
          type="submit"
          @click.prevent="onSubmit()"
          class="from-acc to-acc/80 hover:from-acc/90 hover:to-acc/70 focus:ring-acc/50 inline-flex transform cursor-pointer items-center rounded-xl bg-gradient-to-r px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] focus:ring-2 focus:outline-none"
        >
          <PaperAirplaneIcon class="mr-2 size-5 -rotate-90 transform"></PaperAirplaneIcon>
          Send Message
        </button>
      </div>
    </div>
  </form>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
