import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { users } from "../../../lib/auth/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../../../lib/auth/password";

export const POST: APIRoute = async ({ request, cookies }) => {
    const { email, password } = await request.json();

    // Get user
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    if (!user?.password) {
        return new Response("Invalid credentials", { status: 401 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
        return new Response("Invalid credentials", { status: 401 });
    }

    // Create session
    const session = await auth.createSession(user.id);

    // Set cookie
    cookies.set("session", session.id, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return new Response("OK");
} 