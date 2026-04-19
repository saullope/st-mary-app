import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { sessionId, feedback } = await req.json();

        await prisma.lUDI_SESION.update({
            where: { 
                id: BigInt(sessionId),
                userId: user.id // Security check
            },
            data: { 
                teacherRating: feedback.teacherRating,
                templateDifficulty: feedback.templateDifficulty,
                classEngagement: feedback.classEngagement,
                objectiveMet: feedback.objectiveMet
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error submitting teacher session feedback:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}