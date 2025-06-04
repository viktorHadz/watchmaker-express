// composables/useAuth.js
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { useToastStore } from '@/stores/toast'
import { loginSchema } from '@/schemas/loginSchema'

export const useAuth = () => {
  const toast = (message, type) => useToastStore().showToast(message, type)

  // Reactive state
  const loading = ref(false)
  const session = ref(null)
  const user = ref(null)
  const profile = ref({
    username: null,
    avatar_url: null,
  })

  // Computed properties
  const isAuthenticated = computed(() => !!session.value)
  const userId = computed(() => user.value?.id || null)
  const username = computed(() => profile.value.username)
  const avatarUrl = computed(() => profile.value.avatar_url)

  // Initialize auth state
  const initAuth = async () => {
    try {
      loading.value = true

      // Get initial session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (currentSession) {
        session.value = currentSession
        user.value = currentSession.user
        await getProfile(currentSession.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null

        if (newSession?.user) {
          await getProfile(newSession.user.id)
        } else {
          // Clear profile on logout
          profile.value = {
            username: null,
            avatar_url: null,
          }
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      toast('Failed to initialize authentication', 'error')
    } finally {
      loading.value = false
    }
  }

  // Get user profile
  const getProfile = async (userId) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        profile.value = {
          username: data.username,
          avatar_url: data.avatar_url,
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast('Failed to load user profile', 'error')
    }
  }

  // Login with email and password
  const login = async (email, password) => {
    try {
      loading.value = true

      // Validate inputs
      const validation = loginSchema.safeParse({ email, password })
      if (!validation.success) {
        const errors = validation.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        }))
        return { success: false, errors }
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Profile will be loaded automatically via onAuthStateChange
      toast(`Welcome back, ${profile.value.username || 'User'}!`, 'success')

      return { success: true, data }
    } catch (error) {
      toast(error.message || 'Login failed', 'error')
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast('Logged out successfully', 'success')
      return { success: true }
    } catch (error) {
      toast(error.message || 'Logout failed', 'error')
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    session,
    user,
    profile,

    // Computed
    isAuthenticated,
    userId,
    username,
    avatarUrl,

    // Methods
    initAuth,
    login,
    logout,
    getProfile,
  }
}
