import { adminAuth } from "@/firebase/firebase-admin";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authorization = headers().get("Authorization");

        if (!authorization?.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "No se proporcionó un token válido." },
                { status: 401 }
            );
        }

        const idToken = authorization.split("Bearer ")[1];

        // Verificar el token de ID
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        if (!decodedToken) {
            return NextResponse.json(
                { error: "Token de ID inválido." },
                { status: 401 }
            );
        }

        // Generar la cookie de sesión
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn,
        });

        // Configurar las opciones de la cookie
        const options = {
            name: "session",
            value: sessionCookie,
            maxAge: expiresIn / 1000, // Max-Age en segundos
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
            path: "/", // Disponible en toda la aplicación
        };

        // Establecer la cookie en el navegador
        cookies().set(options);

        return NextResponse.json(
            { message: "Sesión creada exitosamente." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error al crear la cookie de sesión:", error);
        return NextResponse.json(
            { error: "No se pudo crear la sesión." },
            { status: 500 }
        );
    }
}