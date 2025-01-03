import { RateLimiter } from '../lib/security/rate-limiter';
import { getClientIp } from '../lib/utils';
import { rateLimiter } from '../lib/security/rate-limiter-instance';
import { z } from 'astro/zod';

// Validation schema for token
const tokenSchema = z.object({
  token: z.string().min(1).trim()
});

// Security headers
const securityHeaders = {
  'X-FRAME-OPTIONS': 'DENY',
  'X-CONTENT-TYPE-OPTIONS': 'nosniff',
  'X-XSS-PROTECTION': '1; mode=block'
};

export const server = {
  // Verify admin token action
  verifyToken: async (formData: FormData, request: Request) => {
    console.log('[setup] Starting token verification');

    // Parse and validate token
    const token = formData.get('token');
    const result = tokenSchema.safeParse({ token });

    if (!result.success) {
      console.log('[setup] Invalid token format:', token);
      return {
        error: 'Invalid token format'
      };
    }

    // Verify token value
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) {
      console.error('[setup] ADMIN_TOKEN not set!');
      throw new Error('ADMIN_TOKEN is not set');
    }

    if (result.data.token !== adminToken) {
      console.log('[setup] Token mismatch:', {
        received: result.data.token,
        expected: adminToken
      });
      return {
        error: 'Invalid token'
      };
    }

    // Check rate limit
    const clientIp = getClientIp(request);
    console.log('[setup] Checking rate limit for IP:', clientIp);
    
    let rateLimit;
    try {
      console.log('[setup] Calling rateLimiter.check...');
      rateLimit = await rateLimiter.check(clientIp);
      console.log('[setup] Rate limit result:', rateLimit);
    } catch (error) {
      console.error("[setup] Rate limit error:", error);
      return {
        error: 'Internal server error'
      };
    }

    // Check rate limit
    console.log('[setup] Checking rate limit allowed:', rateLimit?.allowed);
    if (!rateLimit?.allowed) {
      console.log('[setup] Rate limit exceeded');
      return {
        error: 'Too many requests'
      };
    }

    console.log('[setup] Request successful');
    // Return success only if both token is valid AND rate limit allows
    return {
      success: true
    };
  }
};
