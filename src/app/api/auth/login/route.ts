import { adminAuth } from "@/firebase/firebase-admin";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_MAX_AGE_MS } from "@/lib/auth/constants";

export async function POST(request: NextRequest) {
    try {
        const authorization = headers().get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "No valid token provided." },
                { status: 401 }
            );
        }

        const idToken = authorization.split("Bearer ")[1];

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Invalid ID token." },
                { status: 401 }
            );
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn: AUTH_COOKIE_MAX_AGE_MS,
        });

        cookies().set({
            name: AUTH_COOKIE_NAME,
            value: sessionCookie,
            maxAge: AUTH_COOKIE_MAX_AGE,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return NextResponse.json(
            { message: "Session created successfully." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error creating session cookie:", error);
        return NextResponse.json(
            { error: "Failed to create session." },
            { status: 500 }
        );
    }
}