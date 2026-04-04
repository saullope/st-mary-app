import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

// GET: Fetch session status, PIN, and participants (with avatar and score)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const sessionId = BigInt(resolvedParams.id);

    const session = await (prisma as any).lUDI_SESION.findUnique({
      where: { id: sessionId },
      include: {
        LUDI_SESION_PARTICIPANTE: {
          include: {
            avatar: true
          },
          orderBy: {
            puntaje_total: 'desc'
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: session.id.toString(),
      codigo: session.codigo,
      estado: session.estado,
      preguntaActualIndex: session.preguntaActualIndex,
      participantes: session.LUDI_SESION_PARTICIPANTE.map((p: any) => ({
        id: p.id.toString(),
        nombre: p.nombre,
        puntaje_total: p.puntaje_total,
        completado: p.completado,
        avatar: p.avatar
      }))
    });
  } catch (error) {
    console.error("Error fetching session live state:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update session state (start, next, end)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const sessionId = BigInt(resolvedParams.id);
    const body = await request.json();
    const { action } = body;

    const session = await (prisma as any).lUDI_SESION.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let updateData: any = {};

    if (action === "start") {
      updateData.estado = "activa";
      updateData.iniciada_en = new Date();
    } else if (action === "next") {
      updateData.preguntaActualIndex = session.preguntaActualIndex + 1;
    } else if (action === "end") {
      updateData.estado = "finalizada";
      updateData.finalizada_en = new Date();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedSession = await (prisma as any).lUDI_SESION.update({
      where: { id: sessionId },
      data: updateData
    });

    return NextResponse.json({ success: true, estado: updatedSession.estado, preguntaActualIndex: updatedSession.preguntaActualIndex });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
