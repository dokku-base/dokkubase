import type { APIRoute } from 'astro';
import { z } from 'zod';

// Validate request body
const tokenSchema = z.object({
  token: z.string()
    .min(1, "Token is required")
    .max(100, "Token is too long")
});

// Rate limiting with better client identification
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute
const attempts = new Map<string, { 
    count: number, 
    firstAttempt: number,
    lastAttempt: number,
    blocked: boolean 
}>();

// Get client identifier from multiple headers
function getClientId(request: Request): string {
    const headers = [
        request.headers.get("x-forwarded-for"),
        request.headers.get("x-real-ip"),
        request.headers.get("user-agent"),
        request.headers.get("accept-language")
    ];
    
    // Jeśli nie ma żadnych headerów, użyj timestampa
    // Każdy request będzie miał własny limit
    return headers.filter(Boolean).join('|') || 
           `no-headers-${Date.now()}`;
}

// Check if client is rate limited
function isRateLimited(clientId: string): boolean {
    const now = Date.now();
    const attempt = attempts.get(clientId);

    // No previous attempts
    if (!attempt) {
        attempts.set(clientId, { 
            count: 1, 
            firstAttempt: now,
            lastAttempt: now,
            blocked: false 
        });
        return false;
    }

    // Check if blocked
    if (attempt.blocked) {
        // Keep blocked for 5 minutes after last attempt
        if (now - attempt.lastAttempt > 5 * 60 * 1000) {
            attempts.delete(clientId);
            return false;
        }
        return true;
    }

    // Reset if window expired
    if (now - attempt.firstAttempt > RATE_WINDOW) {
        attempt.count = 1;
        attempt.firstAttempt = now;
        attempt.lastAttempt = now;
        attempts.set(clientId, attempt);
        return false;
    }

    // Update attempt count
    attempt.count++;
    attempt.lastAttempt = now;

    // Block if too many attempts
    if (attempt.count > RATE_LIMIT) {
        attempt.blocked = true;
        return true;
    }

    attempts.set(clientId, attempt);
    return false;
}

// Get remaining attempts and reset time
function getRateLimitInfo(clientId: string): { remaining: number, reset: number } {
    const attempt = attempts.get(clientId);
    if (!attempt) {
        return { remaining: RATE_LIMIT, reset: 0 };
    }

    const now = Date.now();
    const reset = attempt.blocked 
        ? Math.ceil((attempt.lastAttempt + 5 * 60 * 1000 - now) / 1000)
        : Math.ceil((attempt.firstAttempt + RATE_WINDOW - now) / 1000);

    const remaining = attempt.blocked 
        ? 0 
        : Math.max(0, RATE_LIMIT - attempt.count);

    return { remaining, reset };
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // 1. Rate limiting
        const clientId = getClientId(request);
        const rateLimited = isRateLimited(clientId);
        const { remaining, reset } = getRateLimitInfo(clientId);

        if (rateLimited) {
            console.log("[Verify] Rate limit exceeded for client:", clientId);
            return new Response(JSON.stringify({ 
                error: "Too many attempts. Please try again later." 
            }), { 
                status: 429,
                headers: { 
                    'Content-Type': 'application/json',
                    'Content-Security-Policy': 'default-src \'self\'',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Resource-Policy': 'same-origin',
                    'Referrer-Policy': 'no-referrer',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                    'Retry-After': String(reset),
                    'X-RateLimit-Limit': String(RATE_LIMIT),
                    'X-RateLimit-Remaining': String(remaining),
                    'X-RateLimit-Reset': String(reset)
                }
            });
        }

        // 2. Get admin token from env
        const adminToken = import.meta.env.ADMIN_TOKEN;
        console.log("[Verify] Admin token:", adminToken ? "present" : "missing");
        
        if (!adminToken) {
            console.error("[Verify] ADMIN_TOKEN not set in environment");
            return new Response(JSON.stringify({ 
                error: "Server configuration error" 
            }), { 
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Content-Security-Policy': 'default-src \'self\'',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Resource-Policy': 'same-origin',
                    'Referrer-Policy': 'no-referrer',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block'
                }
            });
        }

        // 3. Parse and validate request
        const body = await request.json();
        const result = tokenSchema.safeParse(body);
        
        if (!result.success) {
            console.log("[Verify] Validation failed:", result.error);
            return new Response(JSON.stringify({ 
                error: "Invalid request",
                details: result.error.issues
            }), { 
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Content-Security-Policy': 'default-src \'self\'',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Resource-Policy': 'same-origin',
                    'Referrer-Policy': 'no-referrer',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block'
                }
            });
        }

        // 4. Validate token
        console.log("[Verify] Comparing tokens:", result.data.token, adminToken);
        if (result.data.token !== adminToken) {
            return new Response(JSON.stringify({ 
                error: "Invalid token" 
            }), { 
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Content-Security-Policy': 'default-src \'self\'',
                    'Cross-Origin-Opener-Policy': 'same-origin',
                    'Cross-Origin-Resource-Policy': 'same-origin',
                    'Referrer-Policy': 'no-referrer',
                    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block'
                }
            });
        }

        // 5. Set setup token cookie
        cookies.set("setup_token", adminToken, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 15 // 15 minutes to complete setup
        });

        console.log("[Verify] Token valid, setting cookie and redirecting");
        
        // 6. Token valid - redirect to account setup
        return new Response(JSON.stringify({ 
            success: true,
            redirect: "/setup/account"
        }), { 
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Content-Security-Policy': 'default-src \'self\'',
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Resource-Policy': 'same-origin',
                'Referrer-Policy': 'no-referrer',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            }
        });

    } catch (error) {
        console.error("[Verify] Error:", error);
        return new Response(JSON.stringify({ 
            error: "Server error" 
        }), { 
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Content-Security-Policy': 'default-src \'self\'',
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Resource-Policy': 'same-origin',
                'Referrer-Policy': 'no-referrer',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            }
        });
    }
};
