import { NextRequest, NextResponse } from "next/server";
import * as yup from "yup";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";

const awardSchema = yup.object({
    participanteId: yup.mixed<string | number>().required(),
    tipo: yup.string().oneOf(["INSIGNIA", "MISION"] as const).required(),
    codigo: yup.string().trim().max(50).required(),
});

export async function POST(req: NextRequest) {
    try {
        let body: yup.InferType<typeof awardSchema>;
        try {
            body = await awardSchema.validate(await req.json(), { abortEarly: true });
        } catch {
            return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
        }
        const { tipo, codigo } = body;

        const auth = await authorizeParticipant(req, body.participanteId, { requireActive: true });
        if (!auth.ok) return auth.response;
        const participanteId = auth.participanteId;

        // Solo se otorga lo que el docente eligió para la actividad que se está jugando.
        const playedActivity = { LUDI_SESION: { some: { LUDI_SESION_PARTICIPANTE: { some: { id: participanteId } } } } };

        // Nota: la condición para ganar el logro ya se validó en el cliente
        // (a partir de eventos de juego reales). Aquí solo se persiste de forma
        // idempotente - a diferencia del puntaje, no se vuelve a verificar en el
        // servidor (ver achievementRules.ts para el detalle de esta decisión).
        if (tipo === "INSIGNIA") {
            const selected = await prisma.ludiActividadInsignia.findFirst({
                where: { insignia: { codigo }, activity: playedActivity },
                select: { insigniaId: true },
            });
            if (!selected) return notSelected();
            await prisma.ludiParticipanteInsignia.upsert({
                where: { participanteId_insigniaId: { participanteId, insigniaId: selected.insigniaId } },
                update: {},
                create: { participanteId, insigniaId: selected.insigniaId },
            });
        } else {
            const selected = await prisma.ludiActividadMision.findFirst({
                where: { mision: { codigo }, activity: playedActivity },
                select: { misionId: true },
            });
            if (!selected) return notSelected();
            await prisma.ludiParticipanteMision.upsert({
                where: { participanteId_misionId: { participanteId, misionId: selected.misionId } },
                update: {},
                create: { participanteId, misionId: selected.misionId },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error awarding achievement:", error);
        return NextResponse.json({ success: false, error: "No se pudo registrar el logro." }, { status: 500 });
    }
}

function notSelected() {
    return NextResponse.json({ success: false, error: "El logro no está activo en esta actividad." }, { status: 400 });
}
