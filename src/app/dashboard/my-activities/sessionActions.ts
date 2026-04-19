"use server";

import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { revalidatePath } from "next/cache";

export async function createGameSession(activityId: number) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("No autorizado");

        // 1. Generar un PIN de 6 dígitos único y aleatorio
        let pin = "";
        let isUnique = false;
        
        while (!isUnique) {
            pin = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await (prisma as any).lUDI_SESION.findUnique({
                where: { codigo: pin }
            });
            if (!existing) isUnique = true;
        }

        // 2. Crear la sesión en la base de datos
        const newSession = await (prisma as any).lUDI_SESION.create({
            data: {
                LUDI_ACTIVIDAD: {
                    connect: { activityId: activityId }
                },
                user: {
                    connect: { id: user.id }
                },
                codigo: pin,
                estado: "lobby",
                modoJuego: "ESTUDIANTE",
                preguntaActualIndex: 0
            }
        });

        revalidatePath("/dashboard/my-activities");
        
        return { 
            success: true, 
            pin: pin, 
            sessionId: newSession.id.toString() 
        };

    } catch (error: any) {
        console.error("Error creating session:", error);
        return { success: false, error: "No se pudo iniciar la sesión de juego." };
    }
}
