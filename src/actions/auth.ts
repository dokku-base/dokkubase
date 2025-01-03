import { z } from 'astro/zod';

// Validation schema for login
const loginSchema = z.object({
  username: z.string().min(1).trim(),
  password: z.string().min(1)
});

export const server = {
  // Login action (placeholder)
  login: async (formData: FormData) => {
    console.log('[auth] Login attempt');
    return {
      error: 'Not implemented yet'
    };
  }
};
