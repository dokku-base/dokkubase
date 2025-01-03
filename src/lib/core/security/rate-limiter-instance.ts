import { RateLimiter } from './rate-limiter';

// Create rate limiter - 3 requests per 100ms
export const rateLimiter = new RateLimiter(3, 100); 