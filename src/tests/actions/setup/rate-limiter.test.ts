import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../rate-limiter';

describe('RateLimiter', () => {
    let limiter: RateLimiter;
    const TEST_IP = '1.2.3.4';
    
    beforeEach(() => {
        // Create fresh limiter for each test with shorter window
        limiter = new RateLimiter(3, 100); // 3 requests per 100ms
    });

    it('should allow requests within limit', async () => {
        // When: Making a single request
        const result = await limiter.check(TEST_IP);

        // Then: Should be allowed with correct remaining
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(2); // 3 (limit) - 1 (current request) = 2
    });

    it('should include headers', async () => {
        // When: Making request
        const result = await limiter.check(TEST_IP);

        // Then: Should include headers
        const headers = result.headers;
        expect(headers['X-RATELIMIT-LIMIT']).toBe('3');
        expect(headers['X-RATELIMIT-REMAINING']).toBe('2');
        expect(headers['X-RATELIMIT-RESET']).toBeDefined();
    });
});
