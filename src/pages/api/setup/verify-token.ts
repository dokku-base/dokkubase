import type { APIRoute } from 'astro';
import { z } from 'zod';

// Validate request body
const tokenSchema = z.object({
  token: z.string().min(1, "Token is required")
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Get admin token from env
    const adminToken = import.meta.env.ADMIN_TOKEN;
    console.log("[Verify] Admin token:", adminToken ? "present" : "missing");
    
    if (!adminToken) {
      console.error("[Verify] ADMIN_TOKEN not set in environment");
      return new Response(JSON.stringify({ 
        error: "Server configuration error" 
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

    // Parse and validate request
    const body = await request.json();
    const result = tokenSchema.safeParse(body);
    
    if (!result.success) {
      return new Response(JSON.stringify({ 
        error: "Invalid request" 
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

    // Validate token
    console.log("[Verify] Comparing tokens:", result.data.token, adminToken);
    if (result.data.token !== adminToken) {
      return new Response(JSON.stringify({ 
        error: "Invalid token" 
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

    // Set setup token cookie
    cookies.set("setup_token", adminToken, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: 60 * 15 // 15 minutes to complete setup
    });

    console.log("[Verify] Token valid, setting cookie and redirecting");
    
    // Token valid - redirect to account setup
    return new Response(JSON.stringify({ 
      success: true,
      redirect: "/setup/account"
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
    console.error("[Verify] Error:", error);
    return new Response(JSON.stringify({ 
      error: "Server error" 
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
