import { ref, computed, watch } from 'vue'
import { useToastStore } from '@/stores/toast'

const toast = (message, type) => useToastStore().showToast(message, type)

// Singleton state — shared across all components
const session = ref(null)
const user = ref(null)
const loading = ref(false)

let initialized = false
let initPromise = null

function mapSessionUser(authUser) {
  if (!authUser) {
    return null
  }

  return {
    id: authUser.id,
    email: authUser.email,
    username: authUser.username || authUser.name || authUser.email,
    avatar: authUser.avatar || '/default-avatar.png',
    provider: authUser.provider || 'google',
  }
}

async function refreshSession() {
  try {
    loading.value = true

    const response = await fetch('/api/auth/me', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Unable to restore session: ${response.status}`)
    }

    const data = await response.json()
    const mappedUser = data.authenticated ? mapSessionUser(data.user) : null

    session.value = mappedUser ? { user: mappedUser } : null
    user.value = mappedUser

    return mappedUser
  } catch (error) {
    session.value = null
    user.value = null
    console.error('Auth session refresh error:', error)
    return null
  } finally {
    loading.value = false
  }
}

function initAuth() {
  if (initialized) return
  initialized = true

  initPromise = refreshSession()

  watch(session, (newSession, oldSession) => {
    if (!newSession && oldSession) {
      user.value = null
    }
  })
}

export function useAuth() {
  initAuth()

  const isAuthenticated = computed(() => !!session.value)
  const currentUser = computed(() => session.value?.user)

  const refreshUser = async () => {
    if (initPromise) {
      await initPromise
    }

    return refreshSession()
  }

  const logIn = async () => {
    if (isAuthenticated.value) {
      return { success: true, alreadyAuthenticated: true }
    }

    loading.value = true
    window.location.assign('/api/auth/google/login')
    return { success: true }
  }

  const signOut = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      session.value = null
      user.value = null
      toast('Signed out successfully', 'success')
    } catch (error) {
      toast('Error signing out', 'error')
      console.error('Sign out error:', error)
    } finally {
      loading.value = false
    }
  }

  const getAuthToken = () => {
    return null
  }

  return {
    session,
    user,
    loading,
    isAuthenticated,
    currentUser,
    refreshUser,
    logIn,
    signOut,
    getAuthToken,
  }
}
