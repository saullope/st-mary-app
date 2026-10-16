import { answerPoints, readSpeedBonus } from "../scoring";

const base = { correct: true, basePoints: 10, totalTimeMs: 20000 };

describe("answerPoints", () => {
  it("da 0 a una respuesta incorrecta", () => {
    expect(answerPoints({ ...base, correct: false, elapsedMs: 0, speedBonus: true })).toBe(0);
    expect(answerPoints({ ...base, correct: false, elapsedMs: 0, speedBonus: false })).toBe(0);
  });

  it("sin premiar la rapidez da siempre los puntos del docente", () => {
    expect(answerPoints({ ...base, elapsedMs: 0, speedBonus: false })).toBe(10);
    expect(answerPoints({ ...base, elapsedMs: 19999, speedBonus: false })).toBe(10);
  });

  it("con premiar la rapidez va del total (al instante) a la mitad (al final)", () => {
    expect(answerPoints({ ...base, elapsedMs: 0, speedBonus: true })).toBe(10);
    expect(answerPoints({ ...base, elapsedMs: 10000, speedBonus: true })).toBe(8);
    expect(answerPoints({ ...base, elapsedMs: 20000, speedBonus: true })).toBe(5);
  });

  it("acota el tiempo transcurrido al de la pregunta", () => {
    expect(answerPoints({ ...base, elapsedMs: 99999, speedBonus: true })).toBe(5);
    expect(answerPoints({ ...base, elapsedMs: -500, speedBonus: true })).toBe(10);
  });
});

describe("readSpeedBonus", () => {
  it("vale true cuando no hay dato o el JSON no sirve", () => {
    expect(readSpeedBonus(null)).toBe(true);
    expect(readSpeedBonus("{}")).toBe(true);
    expect(readSpeedBonus("no es json")).toBe(true);
    expect(readSpeedBonus('{"speedBonus":"no"}')).toBe(true);
  });

  it("respeta el valor guardado", () => {
    expect(readSpeedBonus('{"speedBonus":false}')).toBe(false);
    expect(readSpeedBonus('{"speedBonus":true}')).toBe(true);
  });
});
