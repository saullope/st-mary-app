import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";
import { studentFeedbackSchema } from "@/features/followUp/followUpSchemas";

/** Valoración del estudiante al terminar: gusto y aprendizaje percibido, de 1 a 5. */
export async function POST(req: NextRequest) {
    try {
        let body: yup.InferType<typeof studentFeedbackSchema>;
        try {
            body = await studentFeedbackSchema.validate(await req.json(), { abortEarly: true });
        } catch {
            return NextResponse.json({ success: false, error: "Datos inválidos." }, { status: 400 });
        }

        // Sin requireActive: el estudiante puede responder aunque el docente ya haya cerrado la sesión.
        const auth = await authorizeParticipant(req, body.participanteId);
        if (!auth.ok) return auth.response;

        const participante = await prisma.lUDI_SESION_PARTICIPANTE.findUnique({
            where: { id: auth.participanteId },
            select: { LUDI_SESION: { select: { user: { select: { config: { select: { enableStudentFeedback: true } } } } } } },
        });
        if (participante?.LUDI_SESION.user.config?.enableStudentFeedback === false) {
            return NextResponse.json({ success: false, error: "El docente desactivó la valoración." }, { status: 403 });
        }

        await prisma.lUDI_SESION_PARTICIPANTE.update({
            where: { id: auth.participanteId },
            data: { studentEnjoyment: body.enjoyment, studentLearning: body.learning },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting student feedback:", error);
        return NextResponse.json({ success: false, error: "No se pudo guardar la valoración." }, { status: 500 });
    }
}
