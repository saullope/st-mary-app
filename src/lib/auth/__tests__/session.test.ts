/**
 * @jest-environment node
 */
import { absoluteExpiresAt, isPastAbsoluteLimit, isRecentSignIn } from "../session";
import { SESSION_ABSOLUTE_TIMEOUT_MS } from "../constants";

jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/firebase/firebase-admin", () => ({ adminAuth: {} }));

const secondsAgo = (ms: number) => Math.floor((Date.now() - ms) / 1000);

describe("límites de la sesión", () => {
  it("el límite absoluto es 12 horas desde el inicio de sesión original", () => {
    const authTime = secondsAgo(0);
    expect(absoluteExpiresAt(authTime) - authTime * 1000).toBe(SESSION_ABSOLUTE_TIMEOUT_MS);
    expect(SESSION_ABSOLUTE_TIMEOUT_MS).toBe(12 * 60 * 60 * 1000);
  });

  it("vence al cumplir el límite aunque haya renovaciones", () => {
    expect(isPastAbsoluteLimit(secondsAgo(11 * 60 * 60 * 1000))).toBe(false);
    expect(isPastAbsoluteLimit(secondsAgo(12 * 60 * 60 * 1000 + 1000))).toBe(true);
  });

  it("solo un inicio de sesión de los últimos 5 minutos puede crear una sesión", () => {
    expect(isRecentSignIn(secondsAgo(60 * 1000))).toBe(true);
    expect(isRecentSignIn(secondsAgo(10 * 60 * 1000))).toBe(false);
  });
});
