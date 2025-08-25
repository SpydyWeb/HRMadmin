import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Please enter the Email" })
    .email('Invalid email address'),

  password: z
    .string().min(4, 'Password must be at least 4 characters long'),
});
