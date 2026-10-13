import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { isSameOrigin } from "@/lib/http/isSameOrigin";
import { teacherFeedbackSchema } from "@/features/followUp/followUpSchemas";

/**
 * Evaluación del docente de una sesión suya: la única vía de guardado, usada al
 * terminar la sesión en vivo y desde el reporte si la omitió.
 */
export async function POST(req: NextRequest) {
    try {
        if (!isSameOrigin(req)) {
            return NextResponse.json({ success: false, error: "Origen no permitido." }, { status: 403 });
        }
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
        }

        let body: yup.InferType<typeof teacherFeedbackSchema>;
        try {
            body = await teacherFeedbackSchema.validate(await req.json(), { abortEarly: true });
        } catch {
            return NextResponse.json({ success: false, error: "Datos inválidos." }, { status: 400 });
        }

        const session = await prisma.lUDI_SESION.findUnique({
            where: { id: BigInt(body.sessionId) },
            select: { userId: true, LUDI_ACTIVIDAD: { select: { plantillaOrigenId: true } } },
        });
        // Igual respuesta si no existe o es de otro docente: no revela qué sesiones existen.
        if (!session || session.userId !== user.id) {
            return NextResponse.json({ success: false, error: "Sesión no encontrada." }, { status: 404 });
        }

        await prisma.lUDI_SESION.update({
            where: { id: BigInt(body.sessionId) },
            data: {
                teacherRating: body.teacherRating,
                objectiveLevel: body.objectiveLevel,
                // La dificultad solo tiene sentido en copias de una plantilla.
                templateDifficulty: session.LUDI_ACTIVIDAD.plantillaOrigenId !== null ? body.templateDifficulty : null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting teacher feedback:", error);
        return NextResponse.json({ success: false, error: "No se pudo guardar la evaluación." }, { status: 500 });
    }
}
