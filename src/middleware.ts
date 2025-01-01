import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";

export const onRequest = defineMiddleware(async ({ cookies, url, locals }, next) => {
    // Get session from cookie
    const sessionId = cookies.get("session")?.value;
    const session = sessionId ? await auth.getSession(sessionId) : null;
    
    // Add session to locals for use in routes
    locals.session = session && session.expiresAt > Date.now() ? session : null;

    // Auth pages - redirect to dashboard if logged in
    const authPages = ["/login", "/register"];
    if (authPages.includes(url.pathname) && locals.session) {
        return Response.redirect(new URL("/", url));
    }

    // API routes - always accessible
    if (url.pathname.startsWith("/api/")) {
        return next();
    }

    // Protected routes - redirect to login if not logged in
    if (!locals.session) {
        const publicRoutes = [...authPages];
        if (!publicRoutes.includes(url.pathname)) {
            return Response.redirect(new URL("/login", url));
        }
    }
    
    return next();
});