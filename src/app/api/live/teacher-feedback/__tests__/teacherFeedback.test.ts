/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "../route";
import prisma from "@/lib/db";
import getCurrentUser from "@/lib/auth/getCurrentUser";

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: { lUDI_SESION: { findUnique: jest.fn(), update: jest.fn() }, ludiNotificacion: { deleteMany: jest.fn() } },
}));
jest.mock("@/lib/auth/getCurrentUser", () => ({ __esModule: true, default: jest.fn() }));

const sesiones = prisma.lUDI_SESION as unknown as { findUnique: jest.Mock; update: jest.Mock };
const notificaciones = (prisma as unknown as { ludiNotificacion: { deleteMany: jest.Mock } }).ludiNotificacion;
const mockUser = getCurrentUser as jest.Mock;

const evaluation = { sessionId: "15", teacherRating: 4, objectiveLevel: 1, templateDifficulty: "ADECUADA" };

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(new NextRequest("http://localhost:3000/api/live/teacher-feedback", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
  }));

beforeEach(() => {
  jest.clearAllMocks();
  mockUser.mockResolvedValue({ id: "docente-1" });
  sesiones.findUnique.mockResolvedValue({ userId: "docente-1", LUDI_ACTIVIDAD: { plantillaOrigenId: 1 } });
});

describe("POST /api/live/teacher-feedback", () => {
  it("guarda efectividad, objetivo (incluido Parcialmente) y dificultad de una copia de plantilla", async () => {
    const res = await post(evaluation);
    expect(res.status).toBe(200);
    expect(sesiones.update).toHaveBeenCalledWith({
      where: { id: BigInt(15) },
      data: { teacherRating: 4, objectiveLevel: 1, templateDifficulty: "ADECUADA" },
    });
    // El aviso "¿Cómo te fue?" de esa sesión deja de tener sentido.
    expect(notificaciones.deleteMany).toHaveBeenCalledWith({ where: { userId: "docente-1", clave: "evaluation:15" } });
  });

  it("descarta la dificultad si la actividad no viene de una plantilla", async () => {
    sesiones.findUnique.mockResolvedValue({ userId: "docente-1", LUDI_ACTIVIDAD: { plantillaOrigenId: null } });
    await post(evaluation);
    expect(sesiones.update).toHaveBeenCalledWith(expect.objectContaining({ data: { teacherRating: 4, objectiveLevel: 1, templateDifficulty: null } }));
  });

  it("no deja evaluar la sesión de otro docente", async () => {
    sesiones.findUnique.mockResolvedValue({ userId: "otro-docente", LUDI_ACTIVIDAD: { plantillaOrigenId: null } });
    const res = await post(evaluation);
    expect(res.status).toBe(404);
    expect(sesiones.update).not.toHaveBeenCalled();
  });

  it("sin sesión responde 401", async () => {
    mockUser.mockResolvedValue(null);
    expect((await post(evaluation)).status).toBe(401);
  });

  it("rechaza peticiones desde otro sitio", async () => {
    expect((await post(evaluation, { origin: "https://otro-sitio.com" })).status).toBe(403);
    expect(sesiones.update).not.toHaveBeenCalled();
  });

  it.each([
    ["sin objetivo", { ...evaluation, objectiveLevel: undefined }],
    ["objetivo fuera de rango", { ...evaluation, objectiveLevel: 3 }],
    ["efectividad fuera de la escala", { ...evaluation, teacherRating: 6 }],
    ["dificultad desconocida", { ...evaluation, templateDifficulty: "Media" }],
    ["id de sesión no numérico", { ...evaluation, sessionId: "abc" }],
  ])("rechaza una evaluación %s", async (_case, body) => {
    expect((await post(body)).status).toBe(400);
    expect(sesiones.update).not.toHaveBeenCalled();
  });
});
