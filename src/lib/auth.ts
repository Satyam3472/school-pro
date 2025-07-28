import { jwtVerify } from "jose";

// Shared secret key function
export const getSecretKey = () => {
  const secret = process.env.SESSION_SECRET;
  
  if (!secret) {
    // In production, log a warning but don't throw an error
    if (process.env.NODE_ENV === "production") {
      console.warn("SESSION_SECRET environment variable is not set in production. Using fallback secret.");
    }
    // Use a fallback secret (not ideal for production, but prevents crashes)
    return "fallback-secret-key-for-production-with-at-least-32-characters-long";
  }
  
  return secret;
};

// Shared session verification function
export async function verifySession(session: string | undefined = "") {
  try {
    if (!session) {
      return null;
    }
    
    const encodedKey = new TextEncoder().encode(getSecretKey());
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    
    // Check if the token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error("[Auth] Session verification failed:", error);
    return null;
  }
}

// Client-side function to get schoolId from session
export function getSchoolIdFromSession(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Get session cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionValue = sessionCookie.split('=')[1];
    if (!sessionValue) {
      return null;
    }
    
    // Decode the JWT payload (client-side, no verification)
    const parts = sessionValue.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Handle base64url encoding
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    return payload.schoolId || null;
  } catch (error) {
    console.error("[Auth] Error getting schoolId from session:", error);
    return null;
  }
} 