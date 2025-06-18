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

    // Write to file
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

export const securityLogger = (req, error) => {
  try {
    const simpleErrors =
      error?.errors?.map((err) => ({
        field: err.path.join('.'),
        issue: err.code,
        message: err.message,
        received: err.received || 'N/A',
      })) || []

    const logObj = {
      timestamp: getNormalDate(true),
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      originalBody: req.body || {},
      validationErrors: simpleErrors,
      errorSummary: simpleErrors.map((e) => `${e.field}: ${e.issue}`).join(', '),
    }

    writeToLog(JSON.stringify(logObj, null, 2))
  } catch (error) {
    console.error('Error creating security log:', error.message)
  }
}
