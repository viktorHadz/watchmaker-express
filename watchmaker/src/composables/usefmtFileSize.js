// composables/useFileSize.js
import { computed } from 'vue'

export function useFileSize() {
  /**
   * Format bytes to human-readable size (decimal units - what users expect)
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {string} Formatted size string (e.g., "10.6 MB")
   */
  const formatFileSize = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return '0 B'

    const k = 1000
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))
    return `${size} ${sizes[i]}`
  }

  /**
   * Convert bytes to MB (decimal)
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Number of decimal places (default: 1)
   * @returns {number} Size in MB
   */
  const toMB = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return 0
    return parseFloat((bytes / 1000000).toFixed(decimals))
  }

  /**
   * Reactive computed for formatting file size
   * @param {Ref<number>} sizeRef - Reactive reference to file size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {ComputedRef<string>} Reactive formatted size
   */
  const useFormattedSize = (sizeRef, decimals = 1) => {
    return computed(() => formatFileSize(sizeRef.value, decimals))
  }

  /**
   * Reactive computed for MB conversion
   * @param {Ref<number>} sizeRef - Reactive reference to file size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {ComputedRef<number>} Reactive size in MB
   */
  const useMBSize = (sizeRef, decimals = 1) => {
    return computed(() => toMB(sizeRef.value, decimals))
  }

  return {
    formatFileSize,
    toMB,
    useFormattedSize,
    useMBSize,
  }
}
