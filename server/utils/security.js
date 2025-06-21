import fs from 'fs'
import path from 'path'
import { formatFileSize } from './formatFileSize.js'

export const getNormalDate = (includeTime = false) => {
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  if (includeTime) {
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const sec = String(date.getSeconds()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${sec}`
  }

  return `${dd}_${mm}_${yyyy}`
}

const writeToLog = (content) => {
  try {
    const logPath = path.join(process.cwd(), '..', 'server', 'logs', 'SecurityLog.txt')
    const logDir = path.dirname(logPath)

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const timestamp = getNormalDate(true)
    const logEntry = `
${'='.repeat(100)}
SECURITY EVENT - ${timestamp}
${'='.repeat(100)}
${content}
${'='.repeat(100)}

`

    fs.writeFile(logPath, logEntry, { flag: 'a+' }, (err) => {
      if (err) {
        console.error('SecLogger Write Error:', err.message)
      } else {
        console.log(`🔒 Security event logged: ${timestamp}`)
      }
    })
  } catch (error) {
    console.error('SecLogger Critical Error:', error.message)
  }
}

/**
 * Detailed security logger with better formatting
 * @param {Object} req - Express request object
 * @param {Object} error - Error object or custom error data
 * @param {string} context - Event context
 * @param {Object} extra - Additional data to log
 */
export const securityLogger = (req, error, context = 'SECURITY_EVENT', extra = {}) => {
  try {
    const size = req.files?.reduce((sum, f) => sum + f.size, 0)
    const logData = {
      EVENT_TYPE: context,
      TIMESTAMP: getNormalDate(true),
      REQUEST_INFO: {
        IP_ADDRESS: req.ip || req.connection?.remoteAddress || 'unknown',
        USER_AGENT: req.get('User-Agent') || 'unknown',
        METHOD: req.method,
        PATH: req.path,
        QUERY: Object.keys(req.query).length > 0 ? req.query : 'none',
        BODY_KEYS: Object.keys(req.body || {}).length > 0 ? Object.keys(req.body) : 'none',
      },
      FILE_INFO: {
        FILES_RECEIVED: req.files?.length || 0,
        FILE_NAMES: req.files?.map((f) => f.originalname) || [],
        TOTAL_SIZE: formatFileSize(size) || 0,
      },
      ERROR_DETAILS: {
        ERROR_COUNT: error?.errors?.length || (error?.message ? 1 : 0),
        ERRORS:
          error?.errors?.map((err) => ({
            PATH: err.path?.join('.') || 'unknown',
            CODE: err.code || 'unknown',
            MESSAGE: err.message || 'unknown',
          })) || (error?.message ? [{ MESSAGE: error.message }] : []),
      },
      ADDITIONAL_DATA: extra,
    }

    // Format for better readability
    const formattedLog = Object.entries(logData)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          const subEntries = Object.entries(value)
            .map(([subKey, subValue]) => `  ${subKey}: ${JSON.stringify(subValue)}`)
            .join('\n')
          return `${key}:\n${subEntries}`
        }
        return `${key}: ${JSON.stringify(value)}`
      })
      .join('\n\n')

    writeToLog(formattedLog)
  } catch (error) {
    console.error('Security Logger Error:', error.message)
  }
}
