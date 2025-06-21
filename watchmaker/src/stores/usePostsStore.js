// stores/posts.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from './toast'
import { useAuth } from '@/composables/useAuth'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const pagination = ref({
    hasNextPage: false,
    hasPrevPage: false,
    limit: null,
    page: 1,
    totalPages: 1,
    totalPosts: 0,
  })

  const toast = (message, type) => {
    const useToast = useToastStore()
    useToast.showToast(message, type)
  }

  const loading = ref(false)
  const isUploading = ref(false)
  const currentPage = ref(1)
  const totalPagesCount = ref(1)

  // For post modal
  const showPostModal = ref(false)
  const selectedPost = ref({})

  // For share modal
  const showShareModal = ref(false)
  const postToShare = ref(null)

  // For editing
  const editing = ref(false)
  const editForm = ref({
    postTitle: '',
    postBody: '',
  })

  // Computed
  const pageNumbers = computed(() => {
    const pageArr = []
    for (let i = 1; i <= totalPagesCount.value; i++) {
      pageArr.push(i)
    }
    return pageArr
  })

  const allPosts = computed(() => ({
    posts: posts.value,
    pagination: pagination.value,
  }))

  const isEditing = computed(() => editing.value)

  // SHARING FUNCTIONS
  function generatePostUrl(postId) {
    return `${window.location.origin}/my-work/${postId}`
  }

  function openShareModal(post) {
    postToShare.value = post
    showShareModal.value = true
  }

  function closeShareModal() {
    console.log('Closing share modal')
    showShareModal.value = false
    postToShare.value = null
  }

  async function copyPostLink(post) {
    const url = generatePostUrl(post.postId)
    try {
      await navigator.clipboard.writeText(url)
      toast('Link copied to clipboard!', 'success')
      return { success: true }
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast('Failed to copy link', 'error')
      return { success: false, error }
    }
  }

  // POST MODAL FUNCTIONS
  function openPost(post) {
    selectedPost.value = post
    showPostModal.value = true
  }

  function closePostModal() {
    console.log('Closing post modal')
    showPostModal.value = false
    selectedPost.value = {}
    cancelEdit()
  }

  // Find and open post by ID (for direct URL access)
  function openPostById(postId) {
    console.log('Looking for post with ID:', postId)
    const post = posts.value.find((p) => p.postId == postId)

    if (post) {
      console.log('Found post, opening modal:', post.postTitle)
      selectedPost.value = post
      showPostModal.value = true
      return post
    } else {
      console.log('Post not found with ID:', postId)
      toast('Post not found', 'error')
      return null
    }
  }

  // EXISTING FUNCTIONS
  async function fetchPosts(page = 1) {
    try {
      loading.value = true
      const response = await fetch(`/api/posts/get-all?page=${page}`)
      if (!response.ok) throw new Error(`Error getting posts: ${response.status}`)
      const data = await response.json()

      posts.value = data.posts
      pagination.value = data.pagination
      totalPagesCount.value = data.pagination.totalPages
      currentPage.value = data.pagination.page

      return data
    } catch (error) {
      console.error('Error fetching posts:', error)
      toast('Failed to load posts', 'error')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createPost(formData) {
    const { getAuthToken } = useAuth()

    try {
      isUploading.value = true
      const token = getAuthToken()

      const response = await fetch('/api/posts/new-post', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }

      await fetchPosts(currentPage.value)
      toast('Post created successfully!', 'success')

      return { success: true, data: result }
    } catch (error) {
      console.error('Error creating post:', error)
      toast(error.message || 'Failed to create post', 'error')
      return { success: false, error }
    } finally {
      isUploading.value = false
    }
  }

  async function deletePost(postId) {
    const { getAuthToken } = useAuth()

    try {
      const token = getAuthToken()
      const response = await fetch(`/api/posts/delete/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Error in response: ${response.status}`)
      }

      const updateUi = posts.value.findIndex((p) => p.postId === postId)
      if (updateUi > -1) {
        posts.value.splice(updateUi, 1)
      }

      await fetchPosts(currentPage.value)
      toast('Post deleted successfully', 'success')
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      toast(error.message || 'Failed to delete post', 'error')
      return false
    }
  }

  async function handlePageChange(page) {
    if (page === currentPage.value || page < 1 || page > totalPagesCount.value) {
      return
    }
    await fetchPosts(page)
  }

  async function initialize() {
    await fetchPosts()
  }

  function initEdit(post) {
    editing.value = true
    selectedPost.value = post
    editForm.value = {
      postTitle: post.postTitle,
      postBody: post.postBody,
    }
    showPostModal.value = true
  }

  async function saveEdit(postId) {
    const { getAuthToken } = useAuth()

    try {
      const token = getAuthToken()

      const response = await fetch(`/api/posts/edit/${postId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postTitle: editForm.value.postTitle,
          postBody: editForm.value.postBody,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Error in response: ${response.status}`)
      }

      selectedPost.value.postTitle = editForm.value.postTitle
      selectedPost.value.postBody = editForm.value.postBody
      editing.value = false
      toast(result.message)
    } catch (error) {
      toast(error.message, 'error')
      console.error(error)
    }
  }

  function cancelEdit() {
    editing.value = false
  }

  return {
    // State
    posts,
    pagination,
    loading,
    isUploading,
    currentPage,
    totalPagesCount,
    selectedPost,
    editForm,

    // Modal states
    showPostModal,
    showShareModal,
    postToShare,

    // Computed
    pageNumbers,
    allPosts,
    isEditing,

    // Post actions
    fetchPosts,
    createPost,
    deletePost,
    handlePageChange,
    initialize,

    // Post modal actions
    openPost,
    closePostModal,
    openPostById,

    // Share modal actions
    openShareModal,
    closeShareModal,
    generatePostUrl,
    copyPostLink,

    // Edit actions
    initEdit,
    saveEdit,
    cancelEdit,
  }
})
