/**
 * Format bytes to human-readable size (decimal units - what users expect)
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted size string (e.g., "10.6 MB")
 */
export const formatFileSize = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B'

  const k = 1000
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))
  return `${size} ${sizes[i]}`
}
