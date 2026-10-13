import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/db";
import { PARTICIPANT_TOKEN_HEADER } from "./constants";
import { sessionPhase } from "./sessionState";

/**
 * Código secreto por participante. Los estudiantes no tienen cuenta: al unirse
 * con el PIN reciben este código y lo envían en cada llamada a /api/play/*, así
 * nadie puede responder a nombre de otro adivinando su id (que es consecutivo).
 * En la base de datos solo se guarda su SHA-256.
 */
export function issueParticipantToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashParticipantToken(token) };
}

export function hashParticipantToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function tokenMatches(token: string | null, expectedHash: string): boolean {
  if (!token) return false;
  const actual = Buffer.from(hashParticipantToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

type AuthorizeResult =
  | { ok: true; participanteId: bigint }
  | { ok: false; response: NextResponse };

interface AuthorizeOptions {
  /** Exige que el docente haya iniciado la actividad y no la haya terminado. */
  requireActive?: boolean;
}

/** Verifica que la petición venga del dueño del participante. */
export async function authorizeParticipant(req: NextRequest, participanteId: unknown, options: AuthorizeOptions = {}): Promise<AuthorizeResult> {
  const deny = (status: number, error: string): AuthorizeResult => ({
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  });

  if (typeof participanteId !== "string" && typeof participanteId !== "number") return deny(400, "Datos incompletos.");
  const idText = String(participanteId);
  if (!/^\d+$/.test(idText)) return deny(400, "Datos inválidos.");

  const participante = await prisma.lUDI_SESION_PARTICIPANTE.findUnique({
    where: { id: BigInt(idText) },
    select: { id: true, token_hash: true, LUDI_SESION: { select: { estado: true } } },
  });
  if (!participante) return deny(404, "Participante no encontrado.");

  // Transición: los participantes creados antes de este control no tienen código.
  if (participante.token_hash && !tokenMatches(req.headers.get(PARTICIPANT_TOKEN_HEADER), participante.token_hash)) {
    return deny(403, "No autorizado para este participante.");
  }
  if (options.requireActive && sessionPhase(participante.LUDI_SESION.estado) !== "active") {
    return deny(409, "La actividad no está en curso.");
  }
  return { ok: true, participanteId: participante.id };
}
