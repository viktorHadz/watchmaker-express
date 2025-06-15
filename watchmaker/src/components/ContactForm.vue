<script setup>
import { reactive, ref, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import { zodFormSchema } from '@/composables/formZodSchema'
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/vue/24/outline'

const toast = useToastStore()
const formSchema = zodFormSchema

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
})

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
    const fieldSchema = formSchema.shape[fieldName]
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

// Watch form fields for changes
watch(
  () => form.firstName,
  (newVal) => {
    debounceValidation('firstName', newVal)
  },
)

watch(
  () => form.lastName,
  (newVal) => {
    debounceValidation('lastName', newVal)
  },
)

watch(
  () => form.email,
  (newVal) => {
    debounceValidation('email', newVal)
  },
)

watch(
  () => form.phone,
  (newVal) => {
    debounceValidation('phone', newVal)
  },
)

watch(
  () => form.message,
  (newVal) => {
    debounceValidation('message', newVal)
  },
)

const onSubmit = async () => {
  // Mark all fields as touched on submit
  Object.keys(fieldStates).forEach((field) => {
    fieldStates[field].touched = true
  })

  const result = formSchema.safeParse(form)

  if (!result.success) {
    // Update all field errors
    const formattedError = result.error.format()
    displayErrors.firstName = formattedError.firstName?._errors[0] || ''
    displayErrors.lastName = formattedError.lastName?._errors[0] || ''
    displayErrors.email = formattedError.email?._errors[0] || ''
    displayErrors.message = formattedError.message?._errors[0] || ''
    displayErrors.phone = formattedError.phone?._errors[0] || ''

    toast.showToast('Please fix the errors.', 'error')
    return
  }

  console.log('Form submitted:', result.data)

  // Wait for the server response
  const success = await postData(result.data)

  // If server responded successfully
  if (success) {
    clearForm()
    toast.showToast('Your message was sent successfully!', 'success')
  }
}

// Update postData to return success/failure
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

const clearForm = () => {
  Object.keys(form).forEach((key) => {
    form[key] = ''
  })

  // Reset field states
  Object.keys(fieldStates).forEach((key) => {
    fieldStates[key].touched = false
    fieldStates[key].focused = false
  })

  // Clear errors
  Object.keys(displayErrors).forEach((key) => {
    displayErrors[key] = ''
  })
}

const selectedFiles = ref([])

const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  const combined = [...selectedFiles.value, ...files]
  const unique = Array.from(new Map(combined.map((f) => [f.name, f])).values())
  selectedFiles.value = unique.slice(0, 5)

  if (combined.length > 5) {
    toast.showToast('You can only upload up to 5 images.', 'error')
  }

  event.target.value = ''
}
</script>

<template>
  <form action="#" method="POST" class="p-8">
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

      <!-- File Upload -->
      <div class="group">
        <div class="mb-4 flex items-center justify-between">
          <label for="file-upload" class="font-sec text-fg font-medium">Watch Images </label>
          <label
            for="file-upload"
            class="bg-acc/10 text-acc hover:bg-acc/20 inline-flex cursor-pointer items-center rounded-lg px-4 py-2 font-medium transition-colors"
          >
            <PlusIcon class="text-acc mr-2 size-4 flex-shrink-0"></PlusIcon>
            Choose Images
          </label>
        </div>

        <input
          type="file"
          name="images"
          accept="image/jpeg,image/png,image/webp"
          multiple
          class="hidden"
          id="file-upload"
          @change="handleFileChange"
        />

        <div v-if="selectedFiles.length > 0" class="grid grid-cols-2 gap-3">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="bg-acc/5 border-acc/20 flex items-center rounded-lg border p-3"
          >
            <svg
              class="text-acc mr-3 h-5 w-5"
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
            <span class="text-fg truncate text-sm">{{ file.name }}</span>
          </div>
        </div>

        <p class="dark:text-acc/60 text-acc/80 mt-2 text-sm">
          Upload up to 5 images of your watch (JPEG, PNG, WebP)
        </p>
      </div>

      <!-- Message -->
      <div class="group">
        <div class="mb-2 flex items-baseline">
          <label for="message" class="font-sec text-fg font-medium">Message</label>
          <span class="ml-1 text-red-500">*</span>
        </div>
        <div class="relative">
          <textarea
            name="message"
            id="message"
            maxlength="1000"
            rows="6"
            class="text-fg placeholder-fg/50 focus:ring-acc/50 focus:border-acc input w-full resize-none rounded-xl"
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
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
