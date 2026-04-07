<script setup>
import TheLogo from '@/components/logo/TheLogo.vue'
import { ArrowRightEndOnRectangleIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import { useAuth } from '@/composables/useAuth'
import { useRoute, useRouter } from 'vue-router'
import TheDivider from '@/components/TheDivider.vue'

const toast = (message, type) => useToastStore().showToast(message, type)
const { loading, logIn, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

const getAdminDestination = () => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/admin/editor')
    ? redirect
    : '/admin/editor'
}

const authErrorMessage = computed(() => {
  const error = route.query.authError

  switch (error) {
    case 'access_denied':
      return 'Google sign-in was cancelled.'
    case 'unauthorized':
      return 'This Google account is not allowed to access the admin area.'
    case 'email_not_verified':
      return 'Your Google account email must be verified before you can sign in.'
    case 'state_mismatch':
      return 'The sign-in session expired. Please try again.'
    case 'callback_failed':
      return 'Google sign-in failed during the callback step.'
    case 'config':
      return 'Google authentication is not configured correctly on the server.'
    case 'missing_code':
      return 'Google did not return a valid login code.'
    default:
      return error ? 'Unable to sign in with Google right now.' : ''
  }
})

async function handleLogin() {
  try {
    toast('Redirecting to Google sign-in...', 'info')
    await logIn()
  } catch (error) {
    console.error('Login error:', error)
    toast(error.message || 'Login failed. Please try again.', 'error')
  }
}

onMounted(() => {
  if (authErrorMessage.value) {
    toast(authErrorMessage.value, 'error')
    router.replace({ path: route.path, query: {} })
  }
})

watch(
  isAuthenticated,
  (authenticated) => {
    if (authenticated && router.currentRoute.value.path === '/admin') {
      router.replace(getAdminDestination())
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="my-4 flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:my-22 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <TheLogo class="mb-8 flex place-self-center"></TheLogo>
      <!-- Decorative divider -->
      <TheDivider />
    </div>
    <h2 class="font-sec text-fg mt-6 line-clamp-1 text-center text-4xl font-normal tracking-wide">
      Sign in to your account
    </h2>

    <div
      class="from-acc mx-auto mt-10 w-full rounded-lg bg-gradient-to-br to-transparent p-px sm:w-lg"
    >
      <div
        class="from-sec to-sec-mute dark:from-sec dark:to-sec-mute space-y-6 rounded-lg bg-gradient-to-br p-6"
      >
        <div class="space-y-3 text-center">
          <p class="text-fg text-2xl leading-relaxed">Admin now uses your Google account.</p>
        </div>

        <div class="flex w-full items-center justify-center pb-2">
          <button
            type="button"
            :disabled="loading"
            class="btn text-fg2 flex min-w-64 items-center justify-center gap-x-3 text-lg"
            @click="handleLogin"
          >
            <div
              v-if="loading"
              class="h-5 w-5 animate-spin rounded-lg border-b-2 border-current"
            ></div>
            <template v-else>
              <ArrowRightEndOnRectangleIcon class="size-5"></ArrowRightEndOnRectangleIcon>
              Continue With Google
            </template>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
