<script setup>
import TheLogo from '@/components/logo/TheLogo.vue'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/vue/24/outline'
import { loginSchema } from './loginSchema'
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/composables/useAuth'
const toast = (message, type) => useToastStore().showToast(message, type)
const { user, loading, isAuthenticated, logIn } = useAuth()

const email = ref('')
const password = ref('')
const errors = ref([])
const emailError = computed(() => errors.value.find((err) => err.field === 'email')?.message || '')
const passwordError = computed(
  () => errors.value.find((err) => err.field === 'password')?.message || '',
)

async function validate() {
  clearErrors()
  const results = loginSchema.safeParse({
    email: email.value,
    password: password.value,
  })
  if (!results.success) {
    const issues = results.error.issues
    issues.forEach((issue) => {
      errors.value.push({
        field: issue.path[0],
        code: issue.code,
        message: issue.message,
      })
    })
    return false
  }

  return results.data
}

const clearErrors = () => {
  errors.value = []
}
const clearFieldError = (fieldName) => {
  errors.value = errors.value.filter((err) => err.field !== fieldName)
}
const clearInputs = () => {
  email.value = ''
  password.value = ''
}

async function handleLogin() {
  try {
    loading.value = true
    const loginDetails = await validate()
    if (!loginDetails) {
      return
    }
    await logIn(loginDetails.email, loginDetails.password)

    toast(`Logged in successfully. Welcome ${user.value?.username || 'back'}!`, 'success')
    clearInputs()
  } catch (error) {
    console.error('Login error:', error)
    toast(error.message || 'Login failed. Please try again.', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <TheLogo class="mb-8 flex place-self-center"></TheLogo>
      <!-- Decorative divider -->
      <div class="flex items-center justify-center space-x-4">
        <div class="to-acc h-px w-16 bg-gradient-to-r from-transparent"></div>
        <div class="flex space-x-2">
          <div class="bg-acc h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/60 h-1.5 w-1.5 rounded-full"></div>
          <div class="bg-acc/30 h-1.5 w-1.5 rounded-full"></div>
        </div>
        <div class="to-acc h-px w-16 bg-gradient-to-l from-transparent"></div>
      </div>
      <h2 class="text-fg font-sec mt-10 text-center text-2xl/9 font-bold tracking-tight">
        Sign in to your account
      </h2>
    </div>

    <div
      class="from-acc/90 mx-auto mt-10 w-full rounded-lg bg-gradient-to-br to-transparent p-[1px] sm:w-lg"
    >
      <form
        class="from-sec to-sec-mute dark:from-sec-mute dark:to-sec space-y-6 rounded-lg bg-gradient-to-br p-4 sm:p-6"
        @submit.prevent="handleLogin"
      >
        <div class="pt-4">
          <div>
            <label for="email" class="input-lbl">Email address</label>
            <div class="mt-2">
              <input
                v-model="email"
                type="email"
                name="email"
                id="email"
                autocomplete="email"
                required="true"
                class="input"
                @input="clearFieldError('email')"
              />
            </div>
          </div>
          <span class="text-danger line-clamp-2 flex h-12 items-start p-2 text-sm">
            {{ emailError }}
          </span>
        </div>

        <div>
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="input-lbl">Password</label>
            </div>
            <div class="mt-2">
              <input
                v-model="password"
                type="password"
                name="password"
                id="password"
                autocomplete="current-password"
                required="true"
                class="input"
                @input="clearFieldError('password')"
              />
            </div>
          </div>
          <span class="text-danger line-clamp-2 flex h-12 items-start p-2 text-sm">
            {{ passwordError }}
          </span>
        </div>

        <div class="flex w-full items-center justify-center pb-4">
          <button type="submit" :disabled="loading" class="btn flex items-center gap-x-2 text-lg">
            <div
              v-if="loading"
              class="h-5 w-5 animate-spin rounded-full border-b-2 border-current"
            ></div>
            <template v-else>
              <ArrowRightEndOnRectangleIcon class="size-5"></ArrowRightEndOnRectangleIcon>
              Sign in
            </template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
