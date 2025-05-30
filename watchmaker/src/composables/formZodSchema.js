import * as z from 'zod'

export const zodFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'First name cannot be empty' })
    .max(50, { message: 'First name cannot exceed 50 characters' })
    .nonempty({ message: 'First name field cannot be empty' }),

  lastName: z
    .string()
    .trim()
    .min(1, { message: 'Last name cannot be empty' })
    .max(50, { message: 'Last name cannot exceed 50 characters' })
    .nonempty({ message: 'Last name field cannot be empty' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Field must be a valid email address' })
    .max(254, { message: 'Email cannot exceed 254 characters' })
    .nonempty({ message: 'Email field cannot be empty' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Message must be at least 10 characters' })
    .max(1000, { message: 'Message is too long' })
    .nonempty({ message: 'Message field cannot be empty' }),
  phone: z
    .string()
    .trim()
    .max(25, { message: 'Phone number too long' })
    .optional()
    .or(z.literal('')),
})
