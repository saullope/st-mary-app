import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";

export async function POST(req: NextRequest) {
    try {
        const { participanteId } = await req.json();

        if (!participanteId) {
            return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
        }

        // El puntaje final ya vive en la base de datos (incrementado
        // pregunta a pregunta en /api/play/submit-answer); aquí solo se
        // marca al participante como completado.
        const auth = await authorizeParticipant(req, participanteId);
        if (!auth.ok) return auth.response;

        await prisma.lUDI_SESION_PARTICIPANTE.update({
            where: { id: auth.participanteId },
            data: { completado: true }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error finish game:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
