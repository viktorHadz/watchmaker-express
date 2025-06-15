import * as z from 'zod'
import sanitizeHtml from 'sanitize-html'

const cleanStringInputs = (input) =>
  typeof input === 'string'
    ? sanitizeHtml(input, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
        allowedAttributes: {},
      })
    : input

/* Sanitizes all string fields from req.body and reassigns to req.body and passess to whatevers using it. CleanBody starts empty on each call to the middleware*/
/**
 * V-DOC:
 * Creates a middleware function that validates and sanitizes request body data using a Zod schema.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate the request body against
 * @returns {Function} Express middleware function that validates and sanitizes req.body
 *
 * @description
 * This middleware performs the following operations:
 * 1. Sanitizes all string inputs in the request body using cleanStringInputs
 * 2. Validates the sanitized data against the provided Zod schema
 * 3. Replaces req.body with the validated data
 * 4. Returns validation errors with 400 status if validation fails
 *
 * @example
 * // Usage with a Zod schema
 * const userSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 *
 * app.post('/users', validateAndSanitize(userSchema), (req, res) => {
 *   // req.body is now validated and sanitized
 * });
 *
 * @throws {Error} Passes non-Zod errors to the next error handler, so
 * ensure you have a try catch block
 */
export const validateAndSanitize = (schema) => {
  return (req, res, next) => {
    try {
      const cleanBody = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key, cleanStringInputs(value)]),
      )

      const validatedData = schema.parse(cleanBody)

      req.body = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        })
      }
      next(error)
    }
  }
}

// Schemas
/**
 * V-DOC: Ensure you add any extra fields to the postschema
 */
export const editPostSchema = z.object({
  postTitle: z.string().min(1).max(200),
  postBody: z.string().min(1).max(10000),
})
/**
 * V-DOC: Ensure you add any extra fields to the postschema
 */

export const formSchema = z.object({
  firstName: z.string().trim().min(1).max(50).nonempty(),
  lastName: z.string().trim().min(1).max(50).nonempty(),
  email: z.string().trim().email().max(254).nonempty(),
  message: z.string().trim().min(10).max(10000).nonempty(),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
})
