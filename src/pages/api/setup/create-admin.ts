import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { users } from "../../../lib/auth/schema";
import { hashPassword } from "../../../lib/auth/password";
import { generateId } from "../../../lib/auth/token";
import { auth } from "../../../lib/auth";
import { adminSchema } from "../../../actions/setup/schemas";
import { errorResponse, successResponse, rateLimiter } from "../../../actions/setup/security";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        // 1. Rate limiting
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const { allowed, remaining, reset } = rateLimiter.check(ip);

        if (!allowed) {
            console.log("[Create] Rate limit exceeded for IP:", ip);
            return errorResponse("Too many attempts. Please try again later.", 429, {
                'Retry-After': String(reset),
                'X-RATELIMIT-REMAINING': String(remaining)
            });
        }

        // 2. Verify setup session
        const setupToken = cookies.get("setup_token")?.value;
        const adminToken = import.meta.env.ADMIN_TOKEN;

        console.log("[Create] Setup token:", setupToken ? "present" : "missing");
        console.log("[Create] Admin token:", adminToken ? "present" : "missing");

        if (!setupToken || !adminToken || setupToken !== adminToken) {
            console.log("[Create] Invalid token");
            return errorResponse("Unauthorized - complete setup first", 401);
        }

        // 3. Check if any users exist
        console.log("[Create] Checking for existing users...");
        const [existingUser] = await db.select().from(users);
        console.log("[Create] Existing user:", existingUser);

        if (existingUser) {
            console.log("[Create] Admin already exists");
            return errorResponse("Admin account already exists", 403);
        }

        // 4. Parse and validate request
        console.log("[Create] Parsing request...");
        const body = await request.json();
        const result = adminSchema.safeParse(body);

        if (!result.success) {
            console.log("[Create] Validation failed:", result.error);
            return errorResponse("Invalid request", 400, result.error.issues);
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

        return successResponse({ redirect: "/" });

    } catch (error) {
        console.error('[Create] Error:', error);
        return errorResponse("Failed to create admin account", 500);
    }
};
