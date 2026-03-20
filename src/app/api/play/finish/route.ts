import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { participanteId } = await req.json();

        await (prisma as any).lUDI_SESION_PARTICIPANTE.update({
            where: { id: BigInt(participanteId) },
            data: { completado: true }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error finish game:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
