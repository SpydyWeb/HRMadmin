import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string().min(1, "Please enter the Username"),

  password: z
    .string().min(4, 'Password must be at least 4 characters long'),
});
