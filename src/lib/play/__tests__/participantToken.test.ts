/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { authorizeParticipant, issueParticipantToken } from "../participantToken";
import { PARTICIPANT_TOKEN_HEADER } from "../constants";

const findUnique = jest.fn();
jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: { lUDI_SESION_PARTICIPANTE: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

const request = (token?: string) =>
  new NextRequest("http://localhost/api/play/finish", {
    method: "POST",
    headers: token ? { [PARTICIPANT_TOKEN_HEADER]: token } : {},
  });

describe("authorizeParticipant", () => {
  const { token, hash } = issueParticipantToken();

  beforeEach(() => findUnique.mockReset());

  it("acepta al participante con su código", async () => {
    findUnique.mockResolvedValue({ id: BigInt(7), token_hash: hash });
    const result = await authorizeParticipant(request(token), "7");
    expect(result.ok).toBe(true);
  });

  it("rechaza un código ajeno o ausente", async () => {
    findUnique.mockResolvedValue({ id: BigInt(7), token_hash: hash });
    const wrong = await authorizeParticipant(request(issueParticipantToken().token), "7");
    const missing = await authorizeParticipant(request(), "7");
    expect(wrong.ok).toBe(false);
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.response.status).toBe(403);
  });

  it("deja pasar a participantes anteriores al control (transición)", async () => {
    findUnique.mockResolvedValue({ id: BigInt(3), token_hash: null });
    expect((await authorizeParticipant(request(), "3")).ok).toBe(true);
  });

  it("valida el id antes de consultar", async () => {
    const result = await authorizeParticipant(request(token), "1 OR 1=1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("con requireActive, rechaza si el docente no ha iniciado la actividad", async () => {
    findUnique.mockResolvedValue({ id: BigInt(7), token_hash: hash, LUDI_SESION: { estado: "lobby" } });
    const waiting = await authorizeParticipant(request(token), "7", { requireActive: true });
    expect(waiting.ok).toBe(false);
    if (!waiting.ok) expect(waiting.response.status).toBe(409);

    findUnique.mockResolvedValue({ id: BigInt(7), token_hash: hash, LUDI_SESION: { estado: "activa" } });
    expect((await authorizeParticipant(request(token), "7", { requireActive: true })).ok).toBe(true);
  });

  it("solo guarda el hash, nunca el código", () => {
    const issued = issueParticipantToken();
    expect(issued.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(issued.hash).not.toContain(issued.token);
  });
});
