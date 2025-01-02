import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { users } from "../../../lib/auth/schema";
import { hashPassword } from "../../../lib/auth/password";
import { generateId } from "../../../lib/auth/token";
import { auth } from "../../../lib/auth";
import { z } from "zod";

// Validate admin account data
const adminSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email must be at most 100 characters")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"),
    password: z.string()
        .min(12, "Password must be at least 12 characters")
        .max(100, "Password must be at most 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

// Rate limiting
const RATE_LIMIT = 5; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute
const attempts = new Map<string, { count: number, firstAttempt: number }>();

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // 1. Rate limiting
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const attempt = attempts.get(ip) || { count: 0, firstAttempt: now };

        // Reset if window expired
        if (now - attempt.firstAttempt > RATE_WINDOW) {
            attempt.count = 0;
            attempt.firstAttempt = now;
        }

        // Check rate limit
        if (attempt.count >= RATE_LIMIT) {
            console.log("[Create] Rate limit exceeded for IP:", ip);
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
                    'Retry-After': String(RATE_WINDOW / 1000)
                }
            });
        }

        // Increment attempt counter
        attempt.count++;
        attempts.set(ip, attempt);

        // 2. Verify setup session
        const setupToken = cookies.get("setup_token")?.value;
        const adminToken = import.meta.env.ADMIN_TOKEN;

        console.log("[Create] Setup token:", setupToken ? "present" : "missing");
        console.log("[Create] Admin token:", adminToken ? "present" : "missing");

        if (!setupToken || !adminToken || setupToken !== adminToken) {
            console.log("[Create] Invalid token");
            return new Response(JSON.stringify({ 
                error: "Unauthorized - complete setup first" 
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

        // 3. Check if any users exist
        console.log("[Create] Checking for existing users...");
        const [existingUser] = await db.select().from(users);
        console.log("[Create] Existing user:", existingUser);

        if (existingUser) {
            console.log("[Create] Admin already exists");
            return new Response(JSON.stringify({ 
                error: "Admin account already exists" 
            }), { 
                status: 403,
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

        // 4. Parse and validate request
        console.log("[Create] Parsing request...");
        const body = await request.json();
        const result = adminSchema.safeParse(body);

        if (!result.success) {
            console.log("[Create] Validation failed:", result.error);
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

        // 5. Create admin user
        console.log("[Create] Creating admin user:", result.data.email);
        const hashedPassword = await hashPassword(result.data.password);
        const user = {
            id: generateId(16),
            email: result.data.email,
            password: hashedPassword,
            createdAt: Date.now()
        };
        await db.insert(users).values(user);
        console.log("[Create] Admin user created");

        // 6. Create auth session
        console.log("[Create] Creating session...");
        const session = await auth.createSession(user.id);
        cookies.set("session", session.id, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        console.log("[Create] Session created");

        // 7. Clear setup token
        cookies.delete("setup_token", { path: "/" });
        console.log("[Create] Setup complete");

        return new Response(JSON.stringify({ 
            success: true,
            redirect: "/"
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
        console.error('[Create] Error:', error);
        return new Response(JSON.stringify({ 
            error: "Failed to create admin account" 
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
