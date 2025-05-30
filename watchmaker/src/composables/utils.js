import { computed } from 'vue'

export function usePostType(object) {
  const postType = computed(() => {
    const title = object.value.title?.trim()
    const bodyText = object.value.bodyText?.trim()
    const titleImage = object.value.titleImage?.length
    const extraImages = object.value.extraImages?.length

    if (title === '' && bodyText === '' && titleImage === 0 && extraImages === 0) {
      return 'empty'
    } else if (titleImage === 0 && extraImages === 0) {
      return 'blog'
    } else if (title === '' && bodyText === '') {
      return 'gallery'
    } else {
      return 'mixed'
    }
  })
  return postType
}

export function useErrorOutline(displayErrors, fieldName) {
  return computed(() => {
    return displayErrors[fieldName] ? 'outline-2 outline-red-400 focus:outline-red-400' : ''
  })
}

// Image compression function
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Set canvas size and draw compressed image
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      // Convert back to blob
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}
