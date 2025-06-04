import * as z from 'zod'

const allowedCharsOnly = /^[a-zA-Z0-9!@#._-]+$/
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .max(32, { message: 'Email cannot exceed 32 characters' })
    .nonempty({ message: 'Email field cannot be empty' })
    .email({ message: 'Must be a valid email address' }),
  password: z
    .string()
    .trim()
    .max(32, { message: 'Password cannot exceed 32 characters' })
    .min(1, { message: 'Password field cannot be empty' })
    .min(6, { message: 'Password must be at least 6 characters long' })
    .refine((val) => allowedCharsOnly.test(val), {
      message: 'Password can only contain letters, numbers, and safe symbols (!@#._-)',
    }),
})
