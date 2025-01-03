import { RateLimiter } from './rate-limiter';

const SECURITY_HEADERS = {
    'Content-Type': 'application/json',
    'Content-Security-Policy': 'default-src \'self\'',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
} as const;

/**
 * Creates a JSON response with security headers
 */
export function jsonResponse<T>(data: T, status: number = 200, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...SECURITY_HEADERS,
            ...extraHeaders
        }
    });
}

/**
 * Creates an error response with security headers
 */
export function errorResponse(message: string, status: number = 500, extraHeaders?: Record<string, string>, details?: unknown) {
    const body = details ? { error: message, details } : { error: message };
    return jsonResponse(body, status, extraHeaders);
}

/**
 * Creates a success response with security headers and optional redirect
 */
export function successResponse<T extends object>(data: T & { redirect?: string }, extraHeaders?: Record<string, string>) {
    return jsonResponse({ success: true, ...data }, 200, extraHeaders);
}

/**
 * Creates a rate limiter with the specified limits
 */
export function createRateLimiter(opts: { 
    limit: number;
    windowMs: number;
    queueTimeout?: number;
} = {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    queueTimeout: 1000 // 1 second
}) {
    return new RateLimiter(opts.limit, opts.windowMs, opts.queueTimeout);
}

// Export default rate limiter for backward compatibility
export const rateLimiter = createRateLimiter();
