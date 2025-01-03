import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken as handler } from '../../../../actions/setup/verify';
import { mockRequest } from '../../../../mocks/request';
import { getClientIp } from '../../../../lib/utils';
import { rateLimiter } from '../../../../lib/security/rate-limiter-instance';

// Mock utils
vi.mock('../../../../lib/utils', () => ({
    getClientIp: vi.fn().mockReturnValue('127.0.0.1')
}));

// Mock environment variables
const MOCK_ADMIN_TOKEN = 'test-admin-token';
process.env.ADMIN_TOKEN = MOCK_ADMIN_TOKEN;

describe('verify-token endpoint', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(rateLimiter, 'check').mockResolvedValue({
            allowed: true,
            remaining: 2,
            reset: 60,
            headers: {
                'X-RATELIMIT-LIMIT': '3',
                'X-RATELIMIT-REMAINING': '2',
                'X-RATELIMIT-RESET': '60'
            }
        });
    });

    describe('request validation', () => {
        it('should reject invalid JSON', async () => {
            // Given: Request with invalid JSON
            const request = new Request('http://test', {
                method: 'POST',
                body: 'invalid json'
            });

            // When: Making request
            const response = await handler(request);

            // Then: Should return 400
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid request');
        });

        it('should reject missing token', async () => {
            // When: Making request without token
            const response = await handler(mockRequest({}));

            // Then: Should return 400
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBe('Invalid request');
        });
    });

    describe('token validation', () => {
        it('should reject invalid token', async () => {
            // When: Making request with wrong token
            const response = await handler(mockRequest({ token: 'wrong' }));

            // Then: Should return 401
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Invalid token');
        });

        it('should accept correct token', async () => {
            // When: Making request with correct token
            const response = await handler(mockRequest({ token: MOCK_ADMIN_TOKEN }));

            // Then: Should return 200
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });
    });

    describe('rate limiting', () => {
        it('should block when rate limit exceeded', async () => {
            // Given: Rate limit exceeded
            vi.spyOn(rateLimiter, 'check').mockResolvedValueOnce({
                allowed: false,
                remaining: 0,
                reset: 60,
                headers: {
                    'X-RATELIMIT-LIMIT': '3',
                    'X-RATELIMIT-REMAINING': '0',
                    'X-RATELIMIT-RESET': '60',
                    'RETRY-AFTER': '60'
                }
            });

            // When: Making request with valid token
            const response = await handler(mockRequest({ token: MOCK_ADMIN_TOKEN }));

            // Then: Should return 429
            expect(response.status).toBe(429);
            const data = await response.json();
            expect(data.error).toBe('Too many requests');
        });

        it('should include rate limit headers', async () => {
            // When: Making request
            const response = await handler(mockRequest({ token: MOCK_ADMIN_TOKEN }));

            // Then: Should include headers
            expect(response.headers.get('X-RATELIMIT-LIMIT')).toBe('3');
            expect(response.headers.get('X-RATELIMIT-REMAINING')).toBe('2');
            expect(response.headers.get('X-RATELIMIT-RESET')).toBe('60');
        });
    });
});
