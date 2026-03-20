import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { participanteId, preguntaId, opcionId, esCorrecta, tiempoMs, puntaje } = await req.json();

        // 1. Guardar la respuesta detallada
        await (prisma as any).ludiRespuestaEstudiante.create({
            data: {
                participante: {
                    connect: { id: BigInt(participanteId) }
                },
                pregunta: {
                    connect: { id: BigInt(preguntaId) }
                },
                opcion: opcionId ? {
                    connect: { id: BigInt(opcionId) }
                } : undefined,
                esCorrecta: esCorrecta,
                tiempoRespuestaMs: tiempoMs,
                puntajeObtenido: puntaje
            }
        });

        // 2. Actualizar el puntaje total del participante
        await (prisma as any).lUDI_SESION_PARTICIPANTE.update({
            where: { id: BigInt(participanteId) },
            data: {
                puntaje_total: {
                    increment: puntaje
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error submit answer:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
