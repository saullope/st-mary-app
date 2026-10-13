import { adminAuth } from "@/firebase/firebase-admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isRecentSignIn, issueSessionCookie } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";

export async function POST() {
    // El mensaje de error lo muestra el formulario de inicio de sesión.
    const t = await getTranslations("AuthErrors");
    try {
        const authorization = (await headers()).get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: t("noToken") },
                { status: 401 }
            );
        }

        const idToken = authorization.split("Bearer ")[1];

        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return NextResponse.json(
                { error: t("invalidToken") },
                { status: 401 }
            );
        }

        // Solo un inicio de sesión recién hecho (credenciales o Google) crea una sesión.
        if (!isRecentSignIn(decodedToken.auth_time)) {
            return NextResponse.json(
                { error: t("stale"), reason: "stale" },
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
                    { error: t("configuration") },
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
                    { error: t("registerFailed") },
                    { status: 500 }
                );
            }
        }
        // -------------------------------

        await issueSessionCookie(idToken);

        return NextResponse.json(
            { message: "Session created successfully." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error creating session cookie:", error);
        return NextResponse.json(
            { error: t("sessionFailed") },
            { status: 500 }
        );
    }
}
