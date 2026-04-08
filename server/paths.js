import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)

export const serverDir = path.dirname(__filename)
export const projectRoot = path.resolve(serverDir, '..')
export const envPath = path.join(serverDir, '.env')
export const databasePath = path.join(serverDir, 'watchmaker-database.db')
export const logsDir = path.join(serverDir, 'logs')
export const securityLogPath = path.join(logsDir, 'SecurityLog.txt')
export const publicUploadsDir = path.join(serverDir, 'public', 'uploads')
export const tempUploadsDir = path.join(serverDir, 'temp', 'uploads')
export const distDir = path.join(projectRoot, 'watchmaker', 'dist')
export const distIndexPath = path.join(distDir, 'index.html')
