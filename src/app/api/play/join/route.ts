import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { pin, nombre, avatarId } = await req.json();

        if (!pin || !nombre || !avatarId) {
            return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
        }

        // 1. Buscar la sesión por el PIN
        const sesion = await (prisma as any).lUDI_SESION.findFirst({
            where: {
                codigo: pin,
                estado: { in: ["lobby", "activa"] }
            },
            include: {
                LUDI_ACTIVIDAD: {
                    include: {
                        activity: true
                    }
                }
            }
        });

        if (!sesion) {
            return NextResponse.json({ success: false, error: "Código de juego no válido o sesión terminada." }, { status: 404 });
        }

        // Validar que no sea una plantilla
        if (sesion.LUDI_ACTIVIDAD.activity.isTemplate) {
            return NextResponse.json({ success: false, error: "No se puede jugar una plantilla directamente." }, { status: 400 });
        }

        // 2. Registrar al participante
        const participante = await (prisma as any).lUDI_SESION_PARTICIPANTE.upsert({
            where: {
                sesion_id_nombre: {
                    sesion_id: sesion.id,
                    nombre: nombre
                }
            },
            update: {
                avatar: {
                    connect: { id: Number(avatarId) }
                },
                puntaje_total: 0,
                completado: false
            },
            create: {
                LUDI_SESION: {
                    connect: { id: sesion.id }
                },
                nombre: nombre,
                avatar: {
                    connect: { id: Number(avatarId) }
                },
                puntaje_total: 0,
                completado: false
            }
        });

        return NextResponse.json({ 
            success: true, 
            sesionId: sesion.id.toString(), 
            participanteId: participante.id.toString() 
        });

    } catch (error: any) {
        console.error("Error join API:", error);
        return NextResponse.json({ success: false, error: "Error interno del servidor." }, { status: 500 });
    }
}
