import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import { db } from "./lib/db";
import { users } from "./lib/auth/schema";

export const onRequest = defineMiddleware(async ({ cookies, url, locals, request }, next) => {
    console.log("[Middleware] Processing request:", url.pathname);
    console.log("[Middleware] Referer:", request.headers.get("referer"));

    // Get session from cookie
    const sessionId = cookies.get("session")?.value;
    const session = sessionId ? await auth.getSession(sessionId) : null;
    locals.session = session && session.expiresAt > Date.now() ? session : null;

    // Check if any users exist
    let hasUsers = false;
    try {
        const [existingUser] = await db.select().from(users);
        hasUsers = !!existingUser;
        console.log("[Middleware] Has users:", hasUsers);
    } catch (error) {
        console.error("[Middleware] Database error:", error);
        return new Response("Database error", { status: 500 });
    }

    // Setup flow
    const setupToken = cookies.get("setup_token")?.value;
    const adminToken = import.meta.env.ADMIN_TOKEN;
    const isSetupTokenValid = setupToken && adminToken && setupToken === adminToken;

    if (!hasUsers) {
        console.log("[Middleware] No users - setup required");
        
        // /setup/token - always accessible if no users
        if (url.pathname === "/setup/token") {
            console.log("[Middleware] Allowing setup token page");
            return next();
        }

        // /setup/account - only with valid token and proper referer
        if (url.pathname === "/setup/account") {
            console.log("[Middleware] Setup token:", isSetupTokenValid ? "valid" : "invalid");
            
            const referer = request.headers.get("referer");
            const isFromTokenPage = referer?.includes("/setup/token");
            console.log("[Middleware] Is from token page:", isFromTokenPage);

            if (!isSetupTokenValid || !isFromTokenPage) {
                console.log("[Middleware] Invalid token or wrong referer, redirecting to setup");
                return Response.redirect(new URL("/setup/token", url));
            }
            return next();
        }

        // /api/setup/* - always accessible
        if (url.pathname.startsWith("/api/setup/")) {
            console.log("[Middleware] Allowing setup API");
            return next();
        }

        // All other pages - redirect to setup
        console.log("[Middleware] Redirecting to setup");
        return Response.redirect(new URL("/setup/token", url));
    }

    // Has users but trying to access setup - redirect to login
    if (url.pathname.startsWith("/setup/")) {
        console.log("[Middleware] Setup complete - redirecting to login");
        return Response.redirect(new URL("/login", url));
    }

    // Auth pages - redirect to dashboard if logged in
    const authPages = ["/login"];
    if (authPages.includes(url.pathname) && locals.session) {
        console.log("[Middleware] Already logged in - redirecting to dashboard");
        return Response.redirect(new URL("/", url));
    }

    // API routes - always accessible
    if (url.pathname.startsWith("/api/")) {
        console.log("[Middleware] API route - allowing");
        return next();
    }

    // Protected routes - redirect to login if not logged in
    if (!locals.session) {
        const publicRoutes = [...authPages];
        if (!publicRoutes.includes(url.pathname)) {
            console.log("[Middleware] Protected route - redirecting to login");
            return Response.redirect(new URL("/login", url));
        }
    }
    
    console.log("[Middleware] Allowing request");
    return next();
});