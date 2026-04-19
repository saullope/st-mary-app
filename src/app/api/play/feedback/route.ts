import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { participanteId, rating, enjoyment, learning } = await req.json();

        await prisma.lUDI_SESION_PARTICIPANTE.update({
            where: { id: BigInt(participanteId) },
            data: { 
                studentRating: parseFloat(rating),
                studentEnjoyment: enjoyment ? parseFloat(enjoyment) : null,
                studentLearning: learning ? parseFloat(learning) : null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error submitting student feedback:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}