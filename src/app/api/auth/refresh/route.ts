import { adminAuth } from "@/firebase/firebase-admin";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/constants";

// POST: Refresh session with new ID token from client
export async function POST(request: NextRequest) {
    try {
        const authorization = (await headers()).get("Authorization");

        // If client sends a fresh ID token, use it to create new session
        if (authorization?.startsWith("Bearer ")) {
            const idToken = authorization.split("Bearer ")[1];
            
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            if (!decodedToken) {
                return NextResponse.json(
                    { error: "Invalid ID token." },
                    { status: 401 }
                );
            }

            const newSessionCookie = await adminAuth.createSessionCookie(idToken, {
                expiresIn: AUTH_COOKIE_MAX_AGE * 1000,
            });

            const cookieStore = await cookies();
            cookieStore.set({
                name: AUTH_COOKIE_NAME,
                value: newSessionCookie,
                maxAge: AUTH_COOKIE_MAX_AGE,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
            });

            return NextResponse.json(
                { message: "Session refreshed.", refreshed: true },
                { status: 200 }
            );
        }

        // If no token provided, check current session status
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (!sessionCookie) {
            return NextResponse.json(
                { error: "No session found.", needsRefresh: true },
                { status: 401 }
            );
        }

        // Check session validity and expiration
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
        
        if (!decodedClaims) {
            return NextResponse.json(
                { error: "Invalid session.", needsRefresh: true },
                { status: 401 }
            );
        }

        const expirationTime = decodedClaims.exp * 1000;
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Indicate if client should refresh the token
        const needsRefresh = (expirationTime - now) < oneDayMs;

        return NextResponse.json({
            message: "Session valid.",
            needsRefresh,
            expiresIn: Math.floor((expirationTime - now) / 1000),
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error in refresh endpoint:", error);

        if (error?.errorInfo?.code === "auth/session-cookie-expired") {
            const cookieStore = await cookies();
            cookieStore.set({
                name: AUTH_COOKIE_NAME,
                value: "",
                maxAge: 0,
                path: "/",
            });
            return NextResponse.json(
                { error: "Session expired.", needsRefresh: true },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to check session." },
            { status: 500 }
        );
    }
}

// GET: Check if session needs refresh
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (!sessionCookie) {
            return NextResponse.json({ needsRefresh: true, valid: false }, { status: 200 });
        }

        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, false);
        
        if (!decodedClaims) {
            return NextResponse.json({ needsRefresh: true, valid: false }, { status: 200 });
        }

        const expirationTime = decodedClaims.exp * 1000;
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        return NextResponse.json({
            valid: true,
            needsRefresh: (expirationTime - now) < oneDayMs,
            expiresIn: Math.floor((expirationTime - now) / 1000),
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ needsRefresh: true, valid: false }, { status: 200 });
    }
}
