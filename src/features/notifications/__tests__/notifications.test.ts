/**
 * @jest-environment node
 */
import prisma from "@/lib/db";
import { notifySessionFinished, syncPendingReviews, listNotifications } from "../notifications.server";
import { parseData, parseMuted } from "../notificationTypes";

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: {
    lUDI_SESION: { findUnique: jest.fn() },
    lUDI_SESION_PARTICIPANTE: { aggregate: jest.fn() },
    ludiRespuestaEstudiante: { count: jest.fn() },
    ludiParticipanteInsignia: { count: jest.fn() },
    ludiUserConfig: { findUnique: jest.fn() },
    ludiNotificacion: { upsert: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  },
}));

const db = prisma as unknown as {
  lUDI_SESION: { findUnique: jest.Mock };
  lUDI_SESION_PARTICIPANTE: { aggregate: jest.Mock };
  ludiRespuestaEstudiante: { count: jest.Mock };
  ludiParticipanteInsignia: { count: jest.Mock };
  ludiUserConfig: { findUnique: jest.Mock };
  ludiNotificacion: { upsert: jest.Mock; deleteMany: jest.Mock; findMany: jest.Mock; count: jest.Mock };
};

const session = (overrides: Record<string, unknown> = {}) => ({
  userId: "docente-1",
  teacherRating: null,
  LUDI_ACTIVIDAD: { activity: { activity_name: "Sumas" } },
  ...overrides,
});

const upsertedTypes = () => db.ludiNotificacion.upsert.mock.calls.map(([args]) => args.create.tipo);

beforeEach(() => {
  jest.clearAllMocks();
  db.lUDI_SESION.findUnique.mockResolvedValue(session());
  db.ludiUserConfig.findUnique.mockResolvedValue({ mutedNotifications: "[]", enableTeacherEvaluation: true });
});

describe("answers to grade", () => {
  it("keeps one notification per session with the pending total", async () => {
    db.ludiRespuestaEstudiante.count.mockResolvedValue(3);
    await syncPendingReviews(BigInt(7));
    const [args] = db.ludiNotificacion.upsert.mock.calls[0];
    expect(args.where).toEqual({ userId_clave: { userId: "docente-1", clave: "review:7" } });
    expect(JSON.parse(args.create.datos)).toEqual({ activity: "Sumas", count: 3 });
    expect(args.create.enlace).toBe("/dashboard/reports/7");
  });

  it("removes the notification once everything is graded", async () => {
    db.ludiRespuestaEstudiante.count.mockResolvedValue(0);
    await syncPendingReviews(BigInt(7));
    expect(db.ludiNotificacion.deleteMany).toHaveBeenCalledWith({ where: { userId: "docente-1", clave: "review:7" } });
    expect(db.ludiNotificacion.upsert).not.toHaveBeenCalled();
  });

  it("respects a muted type", async () => {
    db.ludiUserConfig.findUnique.mockResolvedValue({ mutedNotifications: '["review_pending"]' });
    db.ludiRespuestaEstudiante.count.mockResolvedValue(2);
    await syncPendingReviews(BigInt(7));
    expect(db.ludiNotificacion.upsert).not.toHaveBeenCalled();
  });

  it("never throws: a failure must not break the student's submission", async () => {
    db.lUDI_SESION.findUnique.mockRejectedValue(new Error("db down"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(syncPendingReviews(BigInt(7))).resolves.toBeUndefined();
    spy.mockRestore();
  });
});

describe("finished session", () => {
  beforeEach(() => {
    db.lUDI_SESION_PARTICIPANTE.aggregate.mockResolvedValue({ _count: { _all: 28 }, _avg: { puntaje_total: 81.6 } });
    db.ludiParticipanteInsignia.count.mockResolvedValue(12);
  });

  it("creates the summary and asks for the evaluation", async () => {
    await notifySessionFinished(BigInt(9));
    expect(upsertedTypes()).toEqual(["session_summary", "evaluation_pending"]);
    const [summary] = db.ludiNotificacion.upsert.mock.calls[0];
    expect(JSON.parse(summary.create.datos)).toEqual({ activity: "Sumas", participants: 28, average: 82, badges: 12 });
  });

  it("does not ask for an evaluation already given or turned off", async () => {
    db.lUDI_SESION.findUnique.mockResolvedValue(session({ teacherRating: 4 }));
    await notifySessionFinished(BigInt(9));
    expect(upsertedTypes()).toEqual(["session_summary"]);

    jest.clearAllMocks();
    db.lUDI_SESION.findUnique.mockResolvedValue(session());
    db.lUDI_SESION_PARTICIPANTE.aggregate.mockResolvedValue({ _count: { _all: 3 }, _avg: { puntaje_total: 10 } });
    db.ludiParticipanteInsignia.count.mockResolvedValue(0);
    db.ludiUserConfig.findUnique.mockResolvedValue({ mutedNotifications: "[]", enableTeacherEvaluation: false });
    await notifySessionFinished(BigInt(9));
    expect(upsertedTypes()).toEqual(["session_summary"]);
  });

  it("skips a session nobody played", async () => {
    db.lUDI_SESION_PARTICIPANTE.aggregate.mockResolvedValue({ _count: { _all: 0 }, _avg: { puntaje_total: null } });
    await notifySessionFinished(BigInt(9));
    expect(db.ludiNotificacion.upsert).not.toHaveBeenCalled();
  });
});

describe("listing", () => {
  it("hides muted types and returns serializable items", async () => {
    db.ludiUserConfig.findUnique.mockResolvedValue({ mutedNotifications: '["session_summary"]' });
    db.ludiNotificacion.findMany.mockResolvedValue([
      { id: BigInt(1), tipo: "review_pending", datos: '{"count":2,"activity":"Sumas"}', enlace: "/x", leida: false, actualizadaEn: new Date("2026-10-15T10:00:00Z") },
    ]);
    db.ludiNotificacion.count.mockResolvedValue(1);
    const list = await listNotifications("docente-1");
    expect(db.ludiNotificacion.findMany.mock.calls[0][0].where).toEqual({ userId: "docente-1", tipo: { notIn: ["session_summary"] } });
    expect(list).toEqual({
      unread: 1,
      items: [{ id: "1", type: "review_pending", data: { count: 2, activity: "Sumas" }, link: "/x", read: false, updatedAt: "2026-10-15T10:00:00.000Z" }],
    });
  });
});

describe("stored values", () => {
  it("ignores unknown types and broken JSON", () => {
    expect(parseMuted('["session_summary","x","session_summary"]')).toEqual(["session_summary"]);
    expect(parseMuted("{")).toEqual([]);
    expect(parseData('{"a":1,"b":"x","c":{}}')).toEqual({ a: 1, b: "x" });
    expect(parseData("[1]")).toEqual({});
  });
});
