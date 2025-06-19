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
  function calculateOptimalQuality(fileSize, width, height, baseQuality = 0.8) {
    const megapixels = (width * height) / 1_000_000
    const fileSizeMB = fileSize / (1024 * 1024)

    // For very small files (< 500KB), use high quality
    if (fileSizeMB < 0.5) return Math.min(baseQuality + 0.1, 0.8)

    // For small files (< 2MB), use slightly reduced quality
    if (fileSizeMB < 2) return Math.min(baseQuality, 0.7)

    // For medium files (2-5MB), reduce quality more noticeably
    if (fileSizeMB < 5) return Math.max(baseQuality - 0.1, 0.65)

    // For large files (5-10MB), be more aggressive
    if (fileSizeMB < 10) return Math.max(baseQuality - 0.2, 0.55)

    // For very large files, be quite aggressive
    const sizeRatio = Math.min(fileSizeMB / 15, 1) // More aggressive scaling
    const megapixelRatio = Math.min(megapixels / 15, 1) // Lower threshold for high-res images

    // Use the higher of the two ratios for more aggressive compression
    const reductionFactor = Math.max(sizeRatio, megapixelRatio)
    const qualityReduction = reductionFactor * 0.3 // More aggressive reduction

    return Math.max(baseQuality - qualityReduction, 0.5) // Lower minimum quality
  }

  /**
   * Calculates optimal dimensions based on file size and current dimensions
   * @param {number} fileSize - Original file size in bytes
   * @param {number} width - Original width
   * @param {number} height - Original height
   * @param {number} maxWidth - Maximum allowed width
   * @returns {Object} Optimal dimensions {width, height}
   */
  function calculateOptimalDimensions(fileSize, width, height, maxWidth = 1920) {
    const fileSizeMB = fileSize / (1024 * 1024)
    const megapixels = (width * height) / 1_000_000

    let targetWidth = Math.min(width, maxWidth)

    // For very large files or high-resolution images, reduce dimensions more aggressively
    if (fileSizeMB > 5 || megapixels > 8) {
      // Scale down more for large files
      const scaleFactor = fileSizeMB > 15 ? 0.6 : fileSizeMB > 10 ? 0.7 : 0.8
      targetWidth = Math.min(targetWidth, Math.floor(width * scaleFactor))
    }

    // Ensure we don't go below reasonable minimums
    targetWidth = Math.max(targetWidth, 800)

    const aspectRatio = height / width
    const targetHeight = Math.round(targetWidth * aspectRatio)

    return { width: targetWidth, height: targetHeight }
  }

  /**
   * Compresses an image file with smart optimization
   * @param {File|Blob} file - The image file to compress
   * @param {number} [maxWidth=1920] - Maximum width for the compressed image
   * @param {number} [quality=0.85] - Base compression quality (0-1)
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.outputFormat] - Force specific output format
   * @param {boolean} [options.preserveFormat=true] - Preserve original format
   * @param {boolean} [options.aggressiveResize=true] - Enable aggressive resizing for large files
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

          // Calculate optimal dimensions
          const fileSize = file.size || 0
          let targetDimensions

          if (options.aggressiveResize !== false) {
            targetDimensions = calculateOptimalDimensions(fileSize, img.width, img.height, maxWidth)
          } else {
            // Original behavior
            let width = img.width
            let height = img.height
            const aspectRatio = height / width

            if (width > maxWidth) {
              width = maxWidth
              height = Math.round(width * aspectRatio)
            }
            targetDimensions = { width, height }
          }

          // Set canvas size
          canvas.width = targetDimensions.width
          canvas.height = targetDimensions.height

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Clear canvas and draw image
          ctx.clearRect(0, 0, targetDimensions.width, targetDimensions.height)
          ctx.drawImage(img, 0, 0, targetDimensions.width, targetDimensions.height)

          // Calculate optimal quality using original dimensions for better assessment
          const optimalQuality = calculateOptimalQuality(fileSize, img.width, img.height, quality)

          // Determine output format
          let outputType = options.outputFormat || file.type || 'image/jpeg'

          // Convert large PNGs to JPEG more aggressively
          const preserveFormat = options.preserveFormat !== false // Default true
          if (!preserveFormat && outputType === 'image/png' && fileSize > 1 * 1024 * 1024) {
            // Lowered threshold
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
                const dimensionChange = `${img.width}x${img.height} → ${targetDimensions.width}x${targetDimensions.height}`
                console.log(
                  `[Image Compression] ${blob.name}: ${(fileSize / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB (${reduction}% reduction)`,
                )
                console.log(
                  `[Dimensions] ${dimensionChange}, Quality: ${(optimalQuality * 100).toFixed(0)}%`,
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
    const maxAttempts = 7 // Increased attempts for better results
    let currentMaxWidth = options.maxWidth || 1920

    while (attempts < maxAttempts) {
      compressed = await compressImage(file, currentMaxWidth, quality, {
        ...options,
        aggressiveResize: true, // Always use aggressive resize for size targeting
      })

      if (compressed.size <= targetKB * 1024) {
        return compressed
      }

      // If we're still too large after a few attempts, try reducing dimensions too
      if (attempts > 2 && currentMaxWidth > 800) {
        currentMaxWidth = Math.floor(currentMaxWidth * 0.8)
      }

      // Adjust quality for next attempt
      const ratio = (targetKB * 1024) / compressed.size
      quality = quality * ratio * 0.85 // More conservative adjustment

      if (quality < 0.3) {
        // Lower minimum for more aggressive compression
        quality = 0.3
      }

      attempts++
    }

    return compressed // Return best attempt
  }

  return {
    compressImage,
    compressToSize,
    calculateOptimalQuality,
    calculateOptimalDimensions,
  }
}
