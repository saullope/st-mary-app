import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/firebase/firebase-admin";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  RECENT_SIGN_IN_MS,
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_MS,
} from "./constants";

// auth_time es el momento del inicio de sesión original: se conserva al renovar.
export const absoluteExpiresAt = (authTimeSeconds: number) => authTimeSeconds * 1000 + SESSION_ABSOLUTE_TIMEOUT_MS;

export const isPastAbsoluteLimit = (authTimeSeconds: number) => Date.now() >= absoluteExpiresAt(authTimeSeconds);

export const isRecentSignIn = (authTimeSeconds: number) => Date.now() - authTimeSeconds * 1000 <= RECENT_SIGN_IN_MS;

/** Claims de la sesión si la cookie es válida, no fue revocada y no superó el límite absoluto. */
export async function verifySessionValue(sessionCookie: string | undefined): Promise<DecodedIdToken | null> {
  if (!sessionCookie) return null;
  try {
    const claims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return isPastAbsoluteLimit(claims.auth_time) ? null : claims;
  } catch {
    return null;
  }
}

export async function readSessionClaims(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
}

/** Emite la cookie de sesión a partir de un ID token; dura lo que permite la inactividad. */
export async function issueSessionCookie(idToken: string) {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_IDLE_TIMEOUT_MS });
  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE_NAME,
    value: sessionCookie,
    maxAge: AUTH_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return { idleExpiresAt: Date.now() + SESSION_IDLE_TIMEOUT_MS };
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({ name: AUTH_COOKIE_NAME, value: "", maxAge: 0, path: "/" });
}
