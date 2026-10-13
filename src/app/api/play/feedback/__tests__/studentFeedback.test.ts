/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "../route";
import prisma from "@/lib/db";
import { authorizeParticipant } from "@/lib/play/participantToken";

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: { lUDI_SESION_PARTICIPANTE: { findUnique: jest.fn(), update: jest.fn() } },
}));
jest.mock("@/lib/play/participantToken", () => ({ authorizeParticipant: jest.fn() }));

const participantes = prisma.lUDI_SESION_PARTICIPANTE as unknown as { findUnique: jest.Mock; update: jest.Mock };
const mockAuthorize = authorizeParticipant as jest.Mock;

const withPreference = (enableStudentFeedback: boolean) =>
  participantes.findUnique.mockResolvedValue({ LUDI_SESION: { user: { config: { enableStudentFeedback } } } });

const post = (body: unknown) =>
  POST(new NextRequest("http://localhost/api/play/feedback", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthorize.mockResolvedValue({ ok: true, participanteId: BigInt(7) });
  withPreference(true);
});

describe("POST /api/play/feedback", () => {
  it("guarda gusto y aprendizaje del participante verificado, sin el promedio heredado", async () => {
    const res = await post({ participanteId: "7", enjoyment: 5, learning: 3 });
    expect(res.status).toBe(200);
    expect(participantes.update).toHaveBeenCalledWith({ where: { id: BigInt(7) }, data: { studentEnjoyment: 5, studentLearning: 3 } });
  });

  it.each([
    ["fuera de la escala", { participanteId: "7", enjoyment: 6, learning: 3 }],
    ["cero", { participanteId: "7", enjoyment: 0, learning: 3 }],
    ["decimal", { participanteId: "7", enjoyment: 4.5, learning: 3 }],
    ["texto en vez de número", { participanteId: "7", enjoyment: "5", learning: 3 }],
    ["falta una respuesta", { participanteId: "7", enjoyment: 5 }],
  ])("rechaza una valoración %s", async (_case, body) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    expect(participantes.update).not.toHaveBeenCalled();
  });

  it("no guarda si el código del participante no es válido", async () => {
    mockAuthorize.mockResolvedValue({ ok: false, response: NextResponse.json({}, { status: 403 }) });
    const res = await post({ participanteId: "7", enjoyment: 5, learning: 5 });
    expect(res.status).toBe(403);
    expect(participantes.update).not.toHaveBeenCalled();
  });

  it("respeta la preferencia del docente que desactivó la valoración", async () => {
    withPreference(false);
    const res = await post({ participanteId: "7", enjoyment: 5, learning: 5 });
    expect(res.status).toBe(403);
    expect(participantes.update).not.toHaveBeenCalled();
  });
});
