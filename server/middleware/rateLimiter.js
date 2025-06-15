import { rateLimit } from 'express-rate-limit'

/**
 * Rate limiter middleware configuration for Express.js applications.
 * Limits the number of requests from a single IP address within a specified time window.
 *
 * @type {import('express-rate-limit').RateLimit}
 * @description Configured to allow maximum 10 requests per 10-minute window per IP address.
 * Uses standard rate limit headers and disables legacy X-RateLimit headers.
 *
 * @property {number} windowMs - Time window in milliseconds (10 minutes = 600,000ms)
 * @property {number} max - Maximum number of requests allowed per window per IP
 * @property {boolean} standardHeaders - Enable standard rate limit headers (RateLimit-*)
 * @property {boolean} legacyHeaders - Disable legacy X-RateLimit-* headers
 */
export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
})
