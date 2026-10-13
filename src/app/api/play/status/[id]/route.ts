import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { sessionPhase } from "@/lib/play/sessionState";

/**
 * Fase de la sesión para la sala de espera del estudiante. Es pública como el resto
 * del juego y solo expone la fase, sin participantes ni puntajes.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const sesion = await prisma.lUDI_SESION.findUnique({ where: { id: BigInt(id) }, select: { estado: true } });
  if (!sesion) return NextResponse.json({ error: "Sesión no encontrada." }, { status: 404 });

  return NextResponse.json({ phase: sessionPhase(sesion.estado) }, { headers: { "Cache-Control": "no-store" } });
}
