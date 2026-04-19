import { adminAuth } from "@/firebase/firebase-admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    const session = (await cookies()).get(AUTH_COOKIE_NAME)?.value || "";

    if (!session) {
        return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
    }

    try {
        const decodedClaims = await adminAuth.verifySessionCookie(session, true);

        if (!decodedClaims) {
            return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
        }

        // Fetch User from SQL to ensure we have the latest name/details without Firestore
        const user = await prisma.ludiUser.findFirst({
            where: { firebaseUid: decodedClaims.uid },
            include: { rol: true }
        });

        return NextResponse.json({
            isLogged: true,
            uid: decodedClaims.uid,
            email: decodedClaims.email,
            displayName: user?.nombre || decodedClaims.name || "",
            photoURL: decodedClaims.picture || "",
            role: user?.rol?.nombre || "EDUCADOR"
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });
    }
}