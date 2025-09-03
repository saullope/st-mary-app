import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Eliminar la cookie de sesión
        cookies().set({
            name: "session",
            value: "",
            maxAge: 0, // Expira inmediatamente
            path: "/",
        });

        return NextResponse.json({ message: "Sesión cerrada exitosamente." }, { status: 200 });
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return NextResponse.json({ error: "Error al cerrar sesión." }, { status: 500 });
    }
}