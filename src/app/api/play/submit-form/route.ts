import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";
import {
    LONG_ANSWER_MAX_CHARS,
    gradeFormAnswer,
    isAnswered,
    toFormQuestionType,
    type FormAnswer,
    type GradableQuestion,
    REVIEW_STATUS,
} from "@/features/form/formQuestions";

const TIPO_LUDIFORM = 5;
const DEFAULT_BASE_POINTS = 10;

const bodySchema = yup.object({
    participanteId: yup.string().required().matches(/^\d+$/),
    answers: yup
        .array(
            yup.object({
                preguntaId: yup.string().required().matches(/^\d+$/),
                optionIds: yup.array(yup.string().required().matches(/^\d+$/)).max(20).optional(),
                text: yup.string().max(LONG_ANSWER_MAX_CHARS).optional(),
            })
        )
        .required()
        .min(1)
        .max(200),
});

/**
 * Entrega de un LudiForm completo. El servidor califica las preguntas cerradas
 * y deja las respuestas largas pendientes de revisión del docente.
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
            where: { id: BigInt(body.participanteId) },
            include: {
                _count: { select: { respuestas: true } },
                LUDI_SESION: {
                    include: {
                        LUDI_ACTIVIDAD: {
                            include: {
                                config: true,
                                preguntas: { where: { activo: true }, include: { opciones: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!participante) {
            return NextResponse.json({ success: false, error: "Participante no encontrado." }, { status: 404 });
        }

        const actividad = participante.LUDI_SESION.LUDI_ACTIVIDAD;
        if (actividad.tipoActividadId !== TIPO_LUDIFORM) {
            return NextResponse.json({ success: false, error: "La actividad no es un formulario." }, { status: 400 });
        }
        // Un formulario se entrega una sola vez.
        if (participante.completado || participante._count.respuestas > 0) {
            return NextResponse.json({ success: false, error: "Este formulario ya fue entregado." }, { status: 409 });
        }

        const answersByQuestion = new Map<string, FormAnswer>(body.answers.map((a) => [a.preguntaId, a]));
        const basePoints = actividad.config?.puntajeBase ?? DEFAULT_BASE_POINTS;

        const graded = actividad.preguntas.map((pregunta) => {
            const question: GradableQuestion = {
                id: pregunta.id.toString(),
                type: toFormQuestionType(pregunta.tipoPregunta),
                options: pregunta.opciones.map((o) => ({ id: o.id.toString(), esCorrecta: o.esCorrecta })),
            };
            const answer = answersByQuestion.get(question.id);
            // Solo se aceptan opciones que pertenecen a la pregunta.
            const validOptionIds = (answer?.optionIds ?? []).filter((id) => question.options.some((o) => o.id === id));
            const cleanAnswer: FormAnswer = { preguntaId: question.id, optionIds: validOptionIds, text: answer?.text?.trim() };
            return {
                pregunta,
                question,
                answer: cleanAnswer,
                result: gradeFormAnswer(question, cleanAnswer, pregunta.puntaje ?? basePoints),
            };
        });

        if (graded.some(({ question, answer }) => !isAnswered(question, answer))) {
            return NextResponse.json({ success: false, error: "Responde todas las preguntas antes de entregar." }, { status: 400 });
        }

        const total = graded.reduce((sum, g) => sum + g.result.points, 0);

        await prisma.$transaction(async (tx) => {
            for (const { pregunta, question, answer, result } of graded) {
                await tx.ludiRespuestaEstudiante.create({
                    data: {
                        participante: { connect: { id: participante.id } },
                        pregunta: { connect: { id: pregunta.id } },
                        opcion: question.type === "single" && answer.optionIds?.[0]
                            ? { connect: { id: BigInt(answer.optionIds[0]) } }
                            : undefined,
                        opcionesJson: question.type === "multiple" ? JSON.stringify(answer.optionIds) : null,
                        respuestaTexto: question.type === "long" ? answer.text ?? "" : null,
                        estadoRevision: result.status === "pending" ? REVIEW_STATUS.pending : null,
                        esCorrecta: result.status === "correct",
                        tiempoRespuestaMs: 0,
                        puntajeObtenido: result.points,
                    },
                });
            }
            await tx.lUDI_SESION_PARTICIPANTE.update({
                where: { id: participante.id },
                data: { puntaje_total: { increment: total }, completado: true },
            });
        });

        return NextResponse.json({
            success: true,
            puntaje: total,
            results: graded.map(({ question, result }) => ({ preguntaId: question.id, status: result.status })),
        });
    } catch (error) {
        console.error("Error submit form:", error);
        return NextResponse.json({ success: false, error: "No se pudo entregar el formulario." }, { status: 500 });
    }
}
