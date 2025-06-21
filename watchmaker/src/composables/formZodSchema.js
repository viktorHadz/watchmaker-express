import * as z from 'zod'

// Centralized security validation function
const validateSecurity = (value, options = {}) => {
  const { allowBrackets = false, allowSymbols = true, maxSymbolSequence = 3 } = options

  // Check for script tags (any opening script tag)
  const hasScript = /<script\b/gi.test(value)
  if (hasScript) {
    return { valid: false, message: 'Contains potentially unsafe content' }
  }

  // Check for other dangerous HTML tags
  const dangerousTags = /<(iframe|object|embed|form|input|link|meta|style)\b/gi
  if (dangerousTags.test(value)) {
    return { valid: false, message: 'Contains potentially unsafe HTML tags' }
  }

  // Check for dangerous characters (unless allowed)
  if (!allowBrackets) {
    const hasDangerousChars = /[<>{}]/g.test(value)
    if (hasDangerousChars) {
      return { valid: false, message: 'Contains invalid characters' }
    }
  }

  // Check for excessive symbol sequences
  if (!allowSymbols) {
    const symbolRegex = new RegExp(`[%$#@!*&^]{${maxSymbolSequence},}`, 'g')
    if (symbolRegex.test(value)) {
      return { valid: false, message: `Contains too many consecutive special characters` }
    }
  }

  // Check for potential SQL injection patterns
  const sqlPatterns = /(union\s+select|drop\s+table|delete\s+from|insert\s+into)/gi
  if (sqlPatterns.test(value)) {
    return { valid: false, message: 'Contains potentially unsafe database commands' }
  }

  return { valid: true }
}

// Zod custom refinement helper
const securityRefine = (options = {}) => {
  return z.string().refine(
    (val) => {
      const result = validateSecurity(val, options)
      return result.valid
    },
    (val) => {
      const result = validateSecurity(val, options)
      return { message: result.message || 'Invalid content detected' }
    },
  )
}

export const zodFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'First name cannot be empty' })
    .max(50, { message: 'First name cannot exceed 50 characters' })
    .pipe(securityRefine({ allowBrackets: false, allowSymbols: false })),

  lastName: z
    .string()
    .trim()
    .min(1, { message: 'Last name cannot be empty' })
    .max(50, { message: 'Last name cannot exceed 50 characters' })
    .pipe(securityRefine({ allowBrackets: false, allowSymbols: false })),

  email: z
    .string()
    .trim()
    .email({ message: 'Field must be a valid email address' })
    .max(254, { message: 'Email cannot exceed 254 characters' })
    .pipe(securityRefine({ allowBrackets: false, allowSymbols: true })),

  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(6000, { message: 'Message is too long' })
    .pipe(securityRefine({ allowBrackets: false, allowSymbols: true, maxSymbolSequence: 5 })),

  phone: z
    .string()
    .trim()
    .max(25, { message: 'Phone number too long' })
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true // Empty is allowed
      const result = validateSecurity(val, { allowBrackets: false, allowSymbols: false })
      return result.valid
    }, 'Phone number contains invalid characters'),
})

// Export the helper for standalone use
export { validateSecurity }
