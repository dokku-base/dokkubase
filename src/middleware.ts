import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async ({ cookies, url, locals }, next) => {
    // Public routes - always accessible
    const publicRoutes = ["/login", "/register", "/api/auth/login", "/api/auth/register"];
    if (publicRoutes.includes(url.pathname)) {
        return next();
    }

    // Get session from cookie
    const sessionId = cookies.get("session")?.value;
    if (!sessionId) {
        return Response.redirect(new URL("/login", url));
    }

    // Validate session
    const session = await auth.getSession(sessionId);
    if (!session || session.expiresAt < Date.now()) {
        cookies.delete("session");
        return Response.redirect(new URL("/login", url));
    }

    // Add session to locals for use in routes
    locals.session = session;
    
    return next();
});