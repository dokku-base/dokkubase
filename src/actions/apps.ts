import { z } from 'astro/zod';

// Validation schemas
const appNameSchema = z.object({
  name: z.string().min(1).max(32).trim()
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'Only lowercase letters, numbers and dashes allowed')
});

export const server = {
  // Create new app (placeholder)
  create: async (formData: FormData) => {
    console.log('[apps] Create app attempt');
    return {
      error: 'Not implemented yet'
    };
  },

  // Delete app (placeholder)
  delete: async (formData: FormData) => {
    console.log('[apps] Delete app attempt');
    return {
      error: 'Not implemented yet'
    };
  },

  // Restart app (placeholder)
  restart: async (formData: FormData) => {
    console.log('[apps] Restart app attempt');
    return {
      error: 'Not implemented yet'
    };
  }
};
