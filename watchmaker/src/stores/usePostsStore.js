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

  // For modal
  const showPostModal = ref(false)
  const selectedPost = ref({})

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

  // Actions
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

      // Refresh posts if successful creation
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

      // Remove from local state immediately for better UX
      const updateUi = posts.value.findIndex((p) => p.postId === postId)
      if (updateUi > -1) {
        posts.value.splice(updateUi, 1)
      }

      // Refresh posts
      await fetchPosts(currentPage.value)

      toast('Post deleted successfully', 'success')
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      toast(error.message || 'Failed to delete post', 'error')
      return false
    }
  }

  function openPost(post) {
    selectedPost.value = post
    showPostModal.value = true
  }

  function closePostModal() {
    showPostModal.value = false
    selectedPost.value = {}
    cancelEdit()
  }

  async function handlePageChange(page) {
    if (page === currentPage.value || page < 1 || page > totalPagesCount.value) {
      return
    }
    await fetchPosts(page)
  }

  function handlePostShare(post) {
    // Implement sharing logic
    console.log('Sharing post:', post)
  }

  // Initialize posts on store creation
  function initialize() {
    fetchPosts()
  }
  const editing = ref(false)
  const isEditing = computed(() => {
    if (editing.value) {
      return true
    } else {
      return false
    }
  })
  const editForm = ref({
    postTitle: '',
    postBody: '',
    // Other editable fields in future
  })
  function initEdit(post) {
    editing.value = true
    selectedPost.value = post // For display reference
    // Copy values to edit form
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

      console.log('Edit form title: ', editForm.value.postTitle)
      console.log('Edit form body: ', editForm.value.postBody)

      // Then API call
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
      console.log('Resultata: ', result)
      // If success update UI
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
    // editForm automatically gets reset on next initEdit
  }
  return {
    // State
    posts,
    pagination,
    loading,
    isUploading,
    currentPage,
    totalPagesCount,
    showPostModal,
    selectedPost,
    isEditing,
    editForm,

    // Computed
    pageNumbers,
    allPosts,

    // Actions
    fetchPosts,
    createPost,
    deletePost,
    initEdit,
    openPost,
    closePostModal,
    handlePageChange,
    handlePostShare,
    initialize,
    cancelEdit,
    saveEdit,
  }
})
