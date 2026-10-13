import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";
import { ALL_BADGE_IDS, ALL_MISSION_IDS } from "@/features/gamification/achievementRules";

const BADGE_IDS = new Set(ALL_BADGE_IDS);
const MISSION_IDS = new Set(ALL_MISSION_IDS);

export async function POST(req: NextRequest) {
    try {
        const { participanteId, tipo, codigo } = await req.json();

        if (!participanteId || !codigo || (tipo !== "INSIGNIA" && tipo !== "MISION")) {
            return NextResponse.json({ success: false, error: "Datos incompletos." }, { status: 400 });
        }

        const auth = await authorizeParticipant(req, participanteId, { requireActive: true });
        if (!auth.ok) return auth.response;

        const catalog = tipo === "INSIGNIA" ? BADGE_IDS : MISSION_IDS;
        if (!catalog.has(codigo)) {
            return NextResponse.json({ success: false, error: "Código no reconocido." }, { status: 400 });
        }

        // Nota: la condición para ganar el logro ya se validó en el cliente
        // (GameEngine, a partir de eventos de juego reales). Aquí solo se
        // persiste de forma idempotente - a diferencia del puntaje, no se
        // vuelve a verificar en el servidor (ver achievementRules.ts para
        // el detalle de esta decisión).
        await prisma.ludiLogroParticipante.upsert({
            where: {
                participanteId_tipo_codigo: {
                    participanteId: BigInt(participanteId),
                    tipo,
                    codigo
                }
            },
            update: {},
            create: {
                participante: { connect: { id: BigInt(participanteId) } },
                tipo,
                codigo
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error awarding achievement:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
