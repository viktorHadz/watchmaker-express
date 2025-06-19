import fs from 'fs'
import path from 'path'

export const getNormalDate = (includeTime = false) => {
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()

  if (includeTime) {
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `Date: ${dd}_${mm}_${yyyy} Time: ${hh}_${min}`
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

    const logEntry = `
${'='.repeat(80)}
SECURITY EVENT - ${getNormalDate(true)}
${'='.repeat(80)}
${content}
${'-'.repeat(80)}
    `

    fs.writeFile(logPath, logEntry, { flag: 'a+' }, (err) => {
      if (err) {
        console.error('SecLogger "Write Err": ', err.message)
      } else {
        console.log(`!!**=> Security event logged to: ${logPath}`)
      }
    })
  } catch (error) {
    console.error('SecLogger error:', error.message)
  }
}

/**
 * Simple, concise security logger
 * @param {Object} req - Express request object
 * @param {Object} error - Error object with validation errors
 * @param {string} context - Brief context like 'FILE_VALIDATION' or 'FORM_VALIDATION'
 */
export const securityLogger = (req, error, context = 'VALIDATION_ERROR') => {
  try {
    const errorCount = error?.errors?.length || 0
    const criticalErrors =
      error?.errors?.filter((err) =>
        ['mime_type_mismatch', 'invalid_file_type', 'buffer_error'].includes(err.code),
      ) || []

    const logObj = {
      event: context,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 50) + '...' || 'unknown',
      path: req.path,
      method: req.method,
      fileCount: req.files?.length || 0,
      errorCount,
      criticalCount: criticalErrors.length,
      // Only log the actual critical errors, not all the noise
      criticalErrors: criticalErrors.map((err) => `${err.path?.join('.')}: ${err.message}`),
    }

    writeToLog(JSON.stringify(logObj, null, 2))
  } catch (error) {
    console.error('Error creating security log:', error.message)
  }
}
