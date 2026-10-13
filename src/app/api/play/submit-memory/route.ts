import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";
import { memoryScore } from "@/features/memory/memoryCards";

const TIPO_LUDIMEMORY = 3;
const DEFAULT_POINTS_PER_PAIR = 10;

const bodySchema = yup.object({
    participanteId: yup.string().required().matches(/^\d+$/),
});

/**
 * Cierre de un tablero de LudiMemory. El puntaje lo calcula el servidor a partir
 * de las parejas guardadas, nunca de lo que envía el cliente.
 */
export async function POST(req: NextRequest) {
    let body: yup.InferType<typeof bodySchema>;
    try {
        body = await bodySchema.validate(await req.json(), { stripUnknown: true });
    } catch {
        return NextResponse.json({ success: false, error: "Datos inválidos." }, { status: 400 });
    }

    try {
        const auth = await authorizeParticipant(req, body.participanteId, { requireActive: true });
        if (!auth.ok) return auth.response;

        const participante = await prisma.lUDI_SESION_PARTICIPANTE.findUnique({
            where: { id: auth.participanteId },
            include: {
                LUDI_SESION: {
                    include: {
                        LUDI_ACTIVIDAD: {
                            include: { config: true, _count: { select: { memoriaParejas: true } } },
                        },
                    },
                },
            },
        });

        if (!participante) {
            return NextResponse.json({ success: false, error: "Participante no encontrado." }, { status: 404 });
        }

        const actividad = participante.LUDI_SESION.LUDI_ACTIVIDAD;
        if (actividad.tipoActividadId !== TIPO_LUDIMEMORY) {
            return NextResponse.json({ success: false, error: "La actividad no es LudiMemory." }, { status: 400 });
        }

        const puntaje = memoryScore(actividad._count.memoriaParejas, actividad.config?.puntajeBase ?? DEFAULT_POINTS_PER_PAIR);

        // El filtro por completado hace el cierre atómico: un doble envío no suma dos veces.
        const updated = await prisma.lUDI_SESION_PARTICIPANTE.updateMany({
            where: { id: participante.id, completado: false },
            data: { puntaje_total: { increment: puntaje }, completado: true },
        });
        if (updated.count === 0) {
            return NextResponse.json({ success: false, error: "Este tablero ya fue completado." }, { status: 409 });
        }

        return NextResponse.json({ success: true, puntaje });
    } catch (error) {
        console.error("Error submit memory:", error);
        return NextResponse.json({ success: false, error: "No se pudo guardar el resultado." }, { status: 500 });
    }
}
