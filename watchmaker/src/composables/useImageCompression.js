/**
 * Composable for image compression functionality
 * @returns {Object} Object containing image compression utilities
 */
export function useImageCompression() {
  // Check if we're in development mode at module level
  const isDev = import.meta.env?.MODE === 'development'

  /**
   * Calculates optimal quality based on file size and image dimensions
   * @param {number} fileSize - Original file size in bytes
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {number} baseQuality - Base quality setting
   * @returns {number} Adjusted quality value
   */
  function calculateOptimalQuality(fileSize, width, height, baseQuality = 0.85) {
    const megapixels = (width * height) / 1_000_000
    const fileSizeMB = fileSize / (1024 * 1024)

    // For small files (< 2MB), use very high quality
    if (fileSizeMB < 2) return Math.min(baseQuality + 0.1, 0.95)

    // For medium files (2-10MB), use base quality
    if (fileSizeMB < 10) return baseQuality

    // For large files, reduce quality slightly
    const sizeRatio = Math.min(fileSizeMB / 20, 1) // 0-1 scale, more gradual
    const megapixelRatio = Math.min(megapixels / 20, 1) // 0-1 scale for 20MP+

    const reductionFactor = Math.max(sizeRatio, megapixelRatio) * 0.8
    return Math.max(baseQuality - reductionFactor * 0.15, 0.7) // Never go below 0.7
  }

  /**
   * Compresses an image file with smart optimization
   * @param {File|Blob} file - The image file to compress
   * @param {number} [maxWidth=1200] - Maximum width for the compressed image
   * @param {number} [quality=0.7] - Base compression quality (0-1)
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.outputFormat] - Force specific output format
   * @param {boolean} [options.preserveFormat=true] - Preserve original format
   * @returns {Promise<Blob>} Compressed image blob
   */
  function compressImage(file, maxWidth = 1920, quality = 0.85, options = {}) {
    return new Promise((resolve, reject) => {
      // Validate inputs
      if (!file) {
        reject(new Error('No file provided'))
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d', { alpha: true }) // Preserve transparency

      if (!ctx) {
        reject(new Error('Failed to create canvas context'))
        return
      }

      const img = new Image()
      let objectUrl = null

      img.onload = async () => {
        try {
          // Clean up object URL immediately
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
            objectUrl = null
          }

          // Calculate new dimensions
          let { width, height } = img
          const aspectRatio = height / width

          if (width > maxWidth) {
            width = maxWidth
            height = Math.round(width * aspectRatio)
          }

          // Set canvas size
          canvas.width = width
          canvas.height = height

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Clear canvas and draw image
          ctx.clearRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)

          // Calculate optimal quality
          const fileSize = file.size || 0
          const optimalQuality = calculateOptimalQuality(fileSize, img.width, img.height, quality)

          // Determine output format
          let outputType = options.outputFormat || file.type || 'image/jpeg'

          // Convert large PNGs to JPEG only if explicitly allowed
          const preserveFormat = options.preserveFormat !== false // Default true
          if (!preserveFormat && outputType === 'image/png' && fileSize > 2 * 1024 * 1024) {
            outputType = 'image/jpeg'
          }

          // Create the blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create image blob'))
                return
              }

              // Preserve metadata
              blob.name = file.name || 'image'
              blob.lastModified = file.lastModified || Date.now()

              // Log compression stats in development
              if (isDev && fileSize > 0) {
                const reduction = ((1 - blob.size / fileSize) * 100).toFixed(1)
                console.log(
                  `[Image Compression] ${blob.name}: ${(fileSize / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB (${reduction}% reduction)`,
                )
              }

              resolve(blob)
            },
            outputType,
            outputType === 'image/png' ? 1 : optimalQuality, // PNG doesn't use quality
          )
        } catch (error) {
          reject(new Error(`Compression failed: ${error.message}`))
        }
      }

      img.onerror = () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          objectUrl = null
        }
        reject(new Error(`Failed to load image: ${file.name || 'unknown'}`))
      }

      // Create object URL and load image
      try {
        objectUrl = URL.createObjectURL(file)
        img.src = objectUrl
      } catch (error) {
        reject(new Error(`Failed to read file: ${error.message}`))
      }
    })
  }

  /**
   * Compress image with specific file size target
   * @param {File|Blob} file - The image file
   * @param {number} targetKB - Target size in KB
   * @param {Object} options - Compression options
   * @returns {Promise<Blob>} Compressed blob
   */
  async function compressToSize(file, targetKB, options = {}) {
    let quality = options.initialQuality || 0.8
    let compressed = null
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      compressed = await compressImage(file, options.maxWidth || 1920, quality, options)

      if (compressed.size <= targetKB * 1024) {
        return compressed
      }

      // Adjust quality for next attempt
      const ratio = (targetKB * 1024) / compressed.size
      quality = quality * ratio * 0.9 // 90% of calculated to undershoot

      if (quality < 0.1) {
        // Can't compress further without unacceptable quality loss
        break
      }

      attempts++
    }

    return compressed // Return best attempt
  }

  return {
    compressImage,
    compressToSize,
    calculateOptimalQuality,
  }
}
