import type { APIRoute } from "astro";
import { authService } from "../../../lib/services/auth.service";
import { auth } from "../../../lib/auth";
import { AppError } from "../../../lib/errors";

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const data = await request.json();
        
        // Login user
        const user = await authService.login(data);
        
        // Create session
        const session = await auth.createSession(user.id);
        
        // Set cookie
        cookies.set("session", session.id, {
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        });

        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        if (error instanceof AppError) {
            return new Response(
                JSON.stringify({ 
                    error: error.message,
                    code: error.code 
                }), 
                { status: error.statusCode }
            );
        }
        
        console.error("Login error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }), 
            { status: 500 }
        );
    }
}; 