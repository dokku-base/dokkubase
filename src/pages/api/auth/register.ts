import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { users } from "../../../lib/auth/schema";
import { hashPassword } from "../../../lib/auth/password";
import { generateId } from "../../../lib/auth/token";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { email, password } = await request.json();

        // Check if it's first user (will be admin)
        const [existingUser] = await db.select().from(users);
        if (existingUser) {
            return new Response(JSON.stringify({ error: "Registration disabled" }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const hashedPassword = await hashPassword(password);
        
        // Create first admin user
        const user = {
            id: generateId(16),
            email,
            password: hashedPassword,
            createdAt: Date.now()
        };

        await db.insert(users).values(user);

        // Create session
        const session = await auth.createSession(user.id);
        
        // Set session cookie
        cookies.set("session", session.id, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30 // 30 days
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ error: "Registration failed" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};