import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { readSessionClaims } from "@/lib/auth/session";

export async function GET() {
    const notLogged = NextResponse.json({ isLogged: false, uid: "", email: "" }, { status: 401 });

    try {
        const decodedClaims = await readSessionClaims();
        if (!decodedClaims) return notLogged;

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
    } catch {
        return notLogged;
    }
}
