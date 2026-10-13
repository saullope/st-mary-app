import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebase-admin";
import { absoluteExpiresAt, clearSessionCookie, issueSessionCookie, readSessionClaims } from "@/lib/auth/session";
import type { SessionEndReason } from "@/lib/auth/constants";

const ended = (reason: SessionEndReason) =>
    NextResponse.json({ valid: false, reason }, { status: 401 });

// POST: renueva la sesión por actividad. Solo extiende una sesión que sigue vigente:
// una vencida por inactividad o por el límite absoluto exige volver a iniciar sesión.
export async function POST() {
    try {
        const claims = await readSessionClaims();
        if (!claims) {
            await clearSessionCookie();
            return ended("idle");
        }

        const authorization = (await headers()).get("Authorization");
        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "No valid token provided." }, { status: 401 });
        }

        const idToken = authorization.slice("Bearer ".length);
        const decoded = await adminAuth.verifyIdToken(idToken);
        if (decoded.uid !== claims.uid) {
            return NextResponse.json({ error: "Token does not match the session." }, { status: 401 });
        }

        const { idleExpiresAt } = await issueSessionCookie(idToken);
        return NextResponse.json({
            valid: true,
            idleExpiresAt,
            absoluteExpiresAt: absoluteExpiresAt(claims.auth_time),
        });
    } catch (error) {
        console.error("Error refreshing session:", error);
        return NextResponse.json({ error: "Failed to refresh session." }, { status: 500 });
    }
}

// GET: estado de la sesión, para que el navegador programe avisos y cierres.
export async function GET() {
    const claims = await readSessionClaims();
    if (!claims) return NextResponse.json({ valid: false }, { status: 200 });
    return NextResponse.json({
        valid: true,
        idleExpiresAt: claims.exp * 1000,
        absoluteExpiresAt: absoluteExpiresAt(claims.auth_time),
    });
}
