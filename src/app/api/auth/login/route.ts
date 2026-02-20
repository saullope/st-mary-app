import { adminAuth } from "@/firebase/firebase-admin";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_MAX_AGE_MS } from "@/lib/auth/constants";
import prisma from "@/lib/db";

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

        // --- Sync User with SQL Server ---
        const { uid, email, name, picture } = decodedToken;

        let user = await prisma.ludiUser.findFirst({
            where: {
                OR: [
                    { firebaseUid: uid },
                    ...(email ? [{ email }] : [])
                ]
            },
        });

        if (user) {
            // User exists: Update 'updatedAt'
            try {
                user = await prisma.ludiUser.update({
                    where: { id: user.id },
                    data: {
                        updatedAt: new Date(),
                        // Optionally update other fields if needed, e.g., name or email if changed in Firebase
                        // nombre: name || user.nombre,
                        // email: email || user.email
                    },
                });
                console.log(`User updated in DB: ${user.id} (${user.email})`);
            } catch (dbError) {
                console.error("Error updating user in DB:", dbError);
                // Non-blocking error, we can still proceed with session creation
            }
        } else {
            // New user: Assign default role 'EDUCADOR'
            const educadorRole = await prisma.ludiRol.findFirst({
                where: { nombre: "EDUCADOR" },
            });

            if (!educadorRole) {
                console.error("Rol 'EDUCADOR' not found in DB. Please run seed.");
                return NextResponse.json(
                    { error: "System configuration error." },
                    { status: 500 }
                );
            }

            try {
                user = await prisma.ludiUser.create({
                    data: {
                        firebaseUid: uid,
                        email: email || null,
                        nombre: name || email?.split("@")[0] || "Usuario",
                        rolId: educadorRole.id,
                    },
                });
                console.log(`User created in DB: ${user.id} (${user.email})`);
            } catch (dbError) {
                console.error("Error creating user in DB:", dbError);
                return NextResponse.json(
                    { error: "Failed to register user data." },
                    { status: 500 }
                );
            }
        }
        // -------------------------------

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
