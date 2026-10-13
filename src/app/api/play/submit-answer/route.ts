import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";

const DEFAULT_BASE_POINTS = 1000;
const DEFAULT_TIME_LIMIT_MS = 30000;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { participanteId, preguntaId, opcionId, tiempoMs } = body;

        if (!participanteId || !preguntaId) {
            return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
        }

        const auth = await authorizeParticipant(req, participanteId, { requireActive: true });
        if (!auth.ok) return auth.response;

        // El acierto y el puntaje se recalculan aquí, en el servidor, a partir
        // de la opción correcta real en la base de datos - nunca se confía en
        // lo que envía el cliente. El cliente sigue mostrando feedback
        // instantáneo de forma optimista; esto solo protege lo que queda
        // persistido (tabla de posiciones en vivo, reportes).
        const pregunta = await prisma.ludiPregunta.findUnique({
            where: { id: BigInt(preguntaId) },
            include: {
                opciones: true,
                activity: { include: { config: true } }
            }
        });

        if (!pregunta) {
            return NextResponse.json({ success: false, error: "Pregunta no encontrada." }, { status: 404 });
        }

        // Los formularios se entregan completos por /api/play/submit-form.
        if (pregunta.tipoPregunta) {
            return NextResponse.json({ success: false, error: "Las preguntas de formulario se entregan con el formulario." }, { status: 400 });
        }

        if (pregunta.esContenido) {
            return NextResponse.json({ success: false, error: "Las diapositivas de contenido no se responden." }, { status: 400 });
        }

        const basePoints = pregunta.puntaje ?? pregunta.activity.config?.puntajeBase ?? DEFAULT_BASE_POINTS;
        const totalTimeMs = pregunta.tiempoLimiteMs ?? pregunta.activity.config?.tiempoPreguntaMs ?? DEFAULT_TIME_LIMIT_MS;

        const selectedOption = opcionId
            ? pregunta.opciones.find((o) => o.id.toString() === opcionId.toString())
            : null;
        const esCorrecta = selectedOption?.esCorrecta ?? false;

        // El tiempo transcurrido reportado por el cliente solo afecta el bono
        // de velocidad (nunca si acertó o no), y se acota al rango válido.
        const elapsedMs = Math.min(Math.max(Number(tiempoMs) || 0, 0), totalTimeMs);
        const timeFactor = esCorrecta ? Math.max(0, (totalTimeMs - elapsedMs) / totalTimeMs) : 0;
        const puntajeObtenido = esCorrecta ? Math.round(basePoints * (0.5 + 0.5 * timeFactor)) : 0;

        // 1. Guardar la respuesta detallada
        await prisma.ludiRespuestaEstudiante.create({
            data: {
                participante: {
                    connect: { id: BigInt(participanteId) }
                },
                pregunta: {
                    connect: { id: BigInt(preguntaId) }
                },
                opcion: selectedOption ? {
                    connect: { id: selectedOption.id }
                } : undefined,
                esCorrecta,
                tiempoRespuestaMs: elapsedMs,
                puntajeObtenido
            }
        });

        // 2. Actualizar el puntaje total del participante
        await prisma.lUDI_SESION_PARTICIPANTE.update({
            where: { id: BigInt(participanteId) },
            data: {
                puntaje_total: {
                    increment: puntajeObtenido
                }
            }
        });

        return NextResponse.json({ success: true, esCorrecta, puntaje: puntajeObtenido });

    } catch (error: any) {
        console.error("Error submit answer:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
