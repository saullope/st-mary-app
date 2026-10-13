import { buildDeck, memoryScore, pairsFromSession, validateMemoryForSave, MEMORY_MAX_PAIRS } from "../memoryCards";
import { evaluateMemoryBadges, evaluateMemoryMissions, type MemoryProgressStats } from "@/features/gamification/achievementRules";
import { badgesFor, catalogKeyForActivity, missionsFor } from "@/features/gamification/catalog";
import { badgeDefs, missionDefs, testCatalog } from "@/features/gamification/testing/catalogFixture";

const stats = (overrides: Partial<MemoryProgressStats> = {}): MemoryProgressStats => ({
  totalPairs: 6,
  pairsFound: 0,
  misses: 0,
  streak: 0,
  isFinished: false,
  ...overrides,
});

describe("tablero de LudiMemory", () => {
  it("cada imagen aporta dos cartas de la misma pareja", () => {
    const deck = buildDeck([{ pairId: "1", imageUrl: "a.png" }, { pairId: "2", imageUrl: "b.png" }]);
    expect(deck).toHaveLength(4);
    expect(new Set(deck.map((c) => c.key)).size).toBe(4);
    expect(deck.filter((c) => c.pairId === "1")).toHaveLength(2);
  });

  it("lee las parejas guardadas y descarta las que no tienen imagen", () => {
    const pairs = pairsFromSession([
      { id: "10", tarjetas: [{ recurso: { url: "a.png" } }, { recurso: { url: "a.png" } }] },
      { id: "11", tarjetas: [] },
    ]);
    expect(pairs).toEqual([{ pairId: "10", imageUrl: "a.png" }]);
  });

  it("el puntaje es por pareja y no depende de los fallos", () => {
    expect(memoryScore(6, 10)).toBe(60);
  });

  it("valida mínimo, máximo y repetidas al guardar", () => {
    expect(validateMemoryForSave(["a.png"])).toEqual({ key: "Validation.memory.tooFew", values: { min: 2 } });
    expect(validateMemoryForSave(Array.from({ length: MEMORY_MAX_PAIRS + 1 }, (_, i) => `${i}.png`))?.key).toBe("Validation.memory.tooMany");
    expect(validateMemoryForSave(["a.png", "a.png"])?.key).toBe("Validation.memory.duplicates");
    expect(validateMemoryForSave(["a.png", "b.png"])).toBeNull();
  });
});

describe("logros de LudiMemory", () => {
  it("tiene catálogo propio de insignias y misiones", () => {
    const key = catalogKeyForActivity("ludimemory");
    expect(badgesFor(testCatalog, key).map((b) => b.code)).toEqual(["coleccionista", "buena-memoria", "imparable"]);
    expect(missionsFor(testCatalog, key, 1).map((m) => m.code)).toEqual(["M1-2-parejas", "M1-2-seguidas", "M1-completo"]);
  });

  it("imparable se gana en vivo con 3 parejas seguidas", () => {
    expect(evaluateMemoryBadges(badgeDefs("imparable"), new Set(), stats({ streak: 2 }))).toEqual([]);
    expect(evaluateMemoryBadges(badgeDefs("imparable"), new Set(), stats({ streak: 3 }))).toEqual(["imparable"]);
  });

  it("al terminar: coleccionista siempre, buena memoria solo con pocos fallos", () => {
    const selected = badgeDefs("coleccionista", "buena-memoria");
    expect(evaluateMemoryBadges(selected, new Set(), stats({ pairsFound: 6, misses: 3, isFinished: true }))).toEqual(["coleccionista", "buena-memoria"]);
    expect(evaluateMemoryBadges(selected, new Set(), stats({ pairsFound: 6, misses: 4, isFinished: true }))).toEqual(["coleccionista"]);
    expect(evaluateMemoryBadges(selected, new Set(), stats({ pairsFound: 3 }))).toEqual([]);
  });

  it("misiones por parejas, racha y tablero completo", () => {
    const selected = missionDefs("M3-4-parejas", "M3-3-seguidas", "M3-completo");
    expect(evaluateMemoryMissions(selected, new Set(), stats({ pairsFound: 4, streak: 1 }))).toEqual(["M3-4-parejas"]);
    expect(evaluateMemoryMissions(selected, new Set(["M3-4-parejas"]), stats({ pairsFound: 5, streak: 3 }))).toEqual(["M3-3-seguidas"]);
    expect(evaluateMemoryMissions(missionDefs("M3-completo"), new Set(), stats({ pairsFound: 6, isFinished: true }))).toEqual(["M3-completo"]);
  });
});
