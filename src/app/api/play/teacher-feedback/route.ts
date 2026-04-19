import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { sesionId, rating } = await req.json();

        await prisma.lUDI_SESION.update({
            where: { id: BigInt(sesionId) },
            data: { teacherRating: parseFloat(rating) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error submitting teacher feedback:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}