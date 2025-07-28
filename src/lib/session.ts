// lib/session.ts
import "server-only";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getSecretKey } from "./auth";

export async function createSession(userId: string, schoolId?: string): Promise<string> {
  const encodedKey = new TextEncoder().encode(getSecretKey());
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const payload: any = { userId, expiresAt };
  if (schoolId) {
    payload.schoolId = schoolId;
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function setSessionCookie(session: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "true",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete("session");
}