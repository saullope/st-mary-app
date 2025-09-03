import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/firebase-admin";

// Obtiene al usuario desde la cookie de sesión
// Si no hay sesión o es inválida, retorna null
const getSession = async () => {
    const session = cookies().get("session")?.value;

    if (!session) {
        console.log("No se encontró la cookie de sesión.");
        return null; // No hay cookie de sesión
    }

    try {
        const user = await adminAuth.verifySessionCookie(session, true);
        return user; // Retorna el usuario autenticado
    } catch (error: any) {
        if (error?.errorInfo?.code === "auth/session-cookie-expired") {
            console.log("La cookie de sesión ha expirado. Redirigiendo al login...");
        } else {
            console.log("Error inesperado al verificar la cookie de sesión:", error);
        }
        return null; // Retorna null si la cookie es inválida o ha expirado
    }
};

export default getSession;