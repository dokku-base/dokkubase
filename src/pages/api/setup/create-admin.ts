import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { users } from "../../../lib/auth/schema";
import { hashPassword } from "../../../lib/auth/password";
import { generateId } from "../../../lib/auth/token";
import { auth } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // 1. Verify setup session
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

        // 2. Check if any users exist
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

        // 3. Parse and validate request
        console.log("[Create] Parsing request...");
        const { email, password } = await request.json();
        if (!email || !password) {
            console.log("[Create] Missing email or password");
            return new Response(JSON.stringify({ 
                error: "Email and password required" 
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

        // 4. Create admin user
        console.log("[Create] Creating admin user:", email);
        const hashedPassword = await hashPassword(password);
        const user = {
            id: generateId(16),
            email,
            password: hashedPassword,
            createdAt: Date.now()
        };
        await db.insert(users).values(user);
        console.log("[Create] Admin user created");

        // 5. Create auth session
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

        // 6. Clear setup token
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
