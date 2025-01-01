import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, request }) => {
    // Clear session cookie
    cookies.delete("session", {
        path: "/"
    });
    
    // Get current URL to build redirect URL
    const url = new URL("/login", request.url);
    return Response.redirect(url);
}; 