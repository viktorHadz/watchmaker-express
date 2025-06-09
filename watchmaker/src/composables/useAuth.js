// useAuth.js or useAuth.ts
import { ref, computed, watch } from 'vue'
import { useToastStore } from '@/stores/toast'
import { supabase } from '@/supabase'

const toast = (message, type) => useToastStore().showToast(message, type)

// Singleton state — shared across all components
const session = ref(null)
const user = ref(null)
const loading = ref(false)

let initialized = false

async function getUserProfile(userSession) {
  try {
    loading.value = true
    const {
      data,
      error: dbErr,
      status,
    } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userSession.user.id)
      .single()

    if (dbErr && status !== 406) throw dbErr

    if (data) {
      return {
        id: userSession.user.id,
        email: userSession.user.email,
        username: data.username,
        avatar: data.avatar_url,
      }
    }
  } catch (err) {
    toast('Error getting profile. Please try again later', 'error')
    console.error(err)
    return null
  } finally {
    loading.value = false
  }
}

function initAuth() {
  if (initialized) return
  initialized = true

  // Initial session load
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // Subscribe to auth state changes
  supabase.auth.onAuthStateChange((event, _session) => {
    session.value = _session
  })

  // Watch session changes
  watch(session, async (newSession, oldSession) => {
    if (newSession) {
      user.value = await getUserProfile(newSession)
    } else if (oldSession) {
      user.value = null
    }
  })
}

export function useAuth() {
  initAuth()

  const isAuthenticated = computed(() => !!session.value)
  const currentUser = computed(() => session.value?.user)

  const refreshUser = async () => {
    if (session.value) {
      user.value = await getUserProfile(session.value)
    }
  }

  const logIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    // If user already logged in
    if (isAuthenticated.value && user.value !== null) {
      throw new Error('Already logged in. Log out first to use another account.')
    }
    return { success: true }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast('Signed out successfully', 'success')
    } catch (error) {
      toast('Error signing out', 'error')
      console.error('Sign out error:', error)
    }
  }

  const getAuthToken = () => {
    console.table('authenticating: ', isAuthenticated.value)
    if (!isAuthenticated.value) {
      throw new Error('Not authenticated')
    }
    if (!session.value?.access_token) {
      throw new Error('No access token provided')
    }
    console.log(session.value?.access_token)
    return session.value?.access_token
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
