/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "../route";
import { PUT } from "../[id]/route";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import { createActivityForUser } from "@/services/activityWrite/createActivity";
import { updateActivityForUser } from "@/services/activityWrite/updateActivity";

jest.mock("@/lib/auth/getCurrentUser", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("@/services/activityWrite/createActivity", () => ({ createActivityForUser: jest.fn() }));
jest.mock("@/services/activityWrite/updateActivity", () => ({ updateActivityForUser: jest.fn() }));
// Sin petición real no hay idioma: los mensajes se devuelven como su clave.
jest.mock("next-intl/server", () => ({ getTranslations: async (ns: string) => (key: string) => `${ns}.${key}` }));

const mockUser = getCurrentUser as jest.Mock;
const mockCreate = createActivityForUser as jest.Mock;
const mockUpdate = updateActivityForUser as jest.Mock;

const teacher = { id: "user-1" };
const validBody = {
  title: "Animales de la granja",
  type: "ludimemory",
  questions: [],
  memoryImages: ["https://img/vaca.jpg", "https://img/gallina.jpg"],
  backgroundImage: "/images/theme/tema1.jpg",
  config: { gradeId: 1, timeLimit: 0, pointsPerCorrect: 10, selectedBadges: ["coleccionista"], selectedMissions: [], voiceEnabled: true },
};

function request(url: string, method: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", host: "localhost:3000", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUser.mockResolvedValue(teacher);
});

describe("POST /api/activities", () => {
  it("crea la actividad con el usuario de la sesión y responde 201", async () => {
    mockCreate.mockResolvedValue({ success: true, message: "Actividad guardada exitosamente", activityId: 42 });
    const res = await POST(request("http://localhost:3000/api/activities", "POST", validBody, { origin: "http://localhost:3000" }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true, message: "Actividad guardada exitosamente", activityId: 42 });
    expect(mockCreate).toHaveBeenCalledWith(teacher, validBody);
  });

  it("sin sesión responde 401 y no guarda", async () => {
    mockUser.mockResolvedValue(null);
    const res = await POST(request("http://localhost:3000/api/activities", "POST", validBody));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Errors.unauthorized" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rechaza peticiones desde otro sitio", async () => {
    const res = await POST(request("http://localhost:3000/api/activities", "POST", validBody, { origin: "https://otro-sitio.com" }));
    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it.each([
    ["sin título", { ...validBody, title: "" }],
    ["tipo desconocido", { ...validBody, type: "sopa-de-letras" }],
    ["sin config", { ...validBody, config: undefined }],
    ["insignias que no son texto", { ...validBody, config: { ...validBody.config, selectedBadges: [1] } }],
  ])("valida el cuerpo (%s) con 400", async (_case, body) => {
    const res = await POST(request("http://localhost:3000/api/activities", "POST", body));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("un cuerpo que no es JSON responde 400", async () => {
    const res = await POST(request("http://localhost:3000/api/activities", "POST", "{no-json"));
    expect(res.status).toBe(400);
  });

  it("devuelve el error del servicio con su código", async () => {
    mockCreate.mockResolvedValue({ error: "Agrega al menos 2 imágenes.", status: 400 });
    const res = await POST(request("http://localhost:3000/api/activities", "POST", validBody));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Agrega al menos 2 imágenes." });
  });
});

describe("PUT /api/activities/[id]", () => {
  const params = (id: string) => ({ params: Promise.resolve({ id }) });

  it("usa el id de la URL aunque el cuerpo traiga otro", async () => {
    mockUpdate.mockResolvedValue({ success: true, message: "Actividad actualizada exitosamente", activityId: 7 });
    const res = await PUT(request("http://localhost:3000/api/activities/7", "PUT", { ...validBody, activityId: 999 }), params("7"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(teacher, expect.objectContaining({ activityId: 7 }));
  });

  it("una actividad ajena responde 403 con el mensaje del servicio", async () => {
    mockUpdate.mockResolvedValue({ error: "Error al actualizar en base de datos: No tienes permiso para editar esta actividad.", status: 403 });
    const res = await PUT(request("http://localhost:3000/api/activities/7", "PUT", validBody), params("7"));
    expect(res.status).toBe(403);
  });

  it("un id que no es numérico responde 404 sin consultar nada", async () => {
    const res = await PUT(request("http://localhost:3000/api/activities/abc", "PUT", validBody), params("abc"));
    expect(res.status).toBe(404);
    expect(mockUser).not.toHaveBeenCalled();
  });
});
