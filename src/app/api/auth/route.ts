import { adminAuth } from "@/firebase/firebase-admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function GET(request: NextRequest) {
    const session = cookies().get(AUTH_COOKIE_NAME)?.value || "";

    if (!session) {
        return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
    }

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(session, true);

        if (!decodedClaims) {
            return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
        }

        return NextResponse.json({
            isLogged: true,
            uid: decodedClaims.uid,
            email: decodedClaims.email,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
    }
}