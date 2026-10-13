import { allowedBlockKinds, isBlockAllowedForGrade, kindFromResourceType, validateLessonForSave, type LessonBlock } from "../lessonBlocks";
import { evaluateLessonBadges, evaluateLessonMissions, type LessonProgressStats } from "@/features/gamification/achievementRules";
import { badgeDefs, missionDefs } from "@/features/gamification/testing/catalogFixture";

describe("bloques por grado", () => {
  it("primero y segundo solo ven contenido básico", () => {
    expect(allowedBlockKinds(1)).toEqual(["canva", "youtube", "image"]);
    expect(allowedBlockKinds(2)).toEqual(["canva", "youtube", "image"]);
  });

  it("tercero ve todos los tipos", () => {
    expect(allowedBlockKinds(3)).toEqual(["canva", "youtube", "image", "reading", "audio", "pdf", "word", "powerpoint"]);
  });

  it("rechaza al guardar un bloque avanzado en primer grado", () => {
    const blocks: LessonBlock[] = [
      { id: 1, kind: "canva", title: "", url: "https://www.canva.com/design/A/b/view?embed" },
      { id: 2, kind: "reading", title: "Lectura", url: null, body: "Texto" },
    ];
    expect(validateLessonForSave(blocks, 1)).toEqual({ key: "Validation.lesson.notAllowed", values: { index: 2, kind: "reading" } });
    expect(validateLessonForSave(blocks, 3)).toBeNull();
  });

  it("exige contenido en cada bloque", () => {
    expect(validateLessonForSave([], 3)?.key).toBe("Validation.lesson.empty");
    expect(validateLessonForSave([{ id: 1, kind: "pdf", title: "", url: null }], 3)).toEqual({ key: "Validation.lesson.emptyContent", values: { index: 1 } });
    expect(validateLessonForSave([{ id: 1, kind: "reading", title: "", url: null, body: "  " }], 3)).toEqual({ key: "Validation.lesson.emptyReading", values: { index: 1 } });
  });

  it("reconstruye el tipo de bloque desde LudiRecurso", () => {
    expect(kindFromResourceType("PDF", "https://x/a.pdf")).toBe("pdf");
    expect(kindFromResourceType("PRESENTACION", "https://www.canva.com/design/A/b/view")).toBe("canva");
    expect(kindFromResourceType(null, null)).toBe("reading");
    expect(isBlockAllowedForGrade("youtube", 1)).toBe(true);
  });
});

describe("logros de lección", () => {
  const base: LessonProgressStats = {
    totalBlocks: 4,
    blocksCompleted: 0,
    blockTimesMs: [],
    readingBlockIndexes: [],
    isFinished: false,
  };

  it("otorga misiones de avance según el grado", () => {
    const selected = missionDefs("L1-2-bloques", "L1-mitad", "L1-completa");
    const afterTwo = { ...base, blocksCompleted: 2, blockTimesMs: [1000, 1000] };
    expect(evaluateLessonMissions(selected, new Set(), afterTwo)).toEqual(["L1-2-bloques", "L1-mitad"]);

    const finished = { ...afterTwo, blocksCompleted: 4, isFinished: true };
    expect(evaluateLessonMissions(selected, new Set(["L1-2-bloques", "L1-mitad"]), finished)).toEqual(["L1-completa"]);
  });

  it("solo otorga insignias al finalizar y si fueron seleccionadas", () => {
    const stats = { ...base, blocksCompleted: 4, blockTimesMs: [12000, 15000, 40000, 11000], readingBlockIndexes: [2], isFinished: true };
    expect(evaluateLessonBadges(badgeDefs("explorador", "atento", "lector"), new Set(), { ...stats, isFinished: false })).toEqual([]);
    expect(evaluateLessonBadges(badgeDefs("explorador", "atento", "lector"), new Set(), stats)).toEqual(["explorador", "atento", "lector"]);
    expect(evaluateLessonBadges(badgeDefs("explorador"), new Set(), stats)).toEqual(["explorador"]);
  });

  it("atento y lector exigen tiempo suficiente en cada bloque", () => {
    const rushed = { ...base, blocksCompleted: 4, blockTimesMs: [12000, 2000, 20000, 11000], readingBlockIndexes: [2], isFinished: true };
    expect(evaluateLessonBadges(badgeDefs("explorador", "atento", "lector"), new Set(), rushed)).toEqual(["explorador"]);
  });

  it("lector no aplica si la lección no tiene lecturas ni documentos", () => {
    const stats = { ...base, blocksCompleted: 4, blockTimesMs: [40000, 40000, 40000, 40000], isFinished: true };
    expect(evaluateLessonBadges(badgeDefs("lector"), new Set(), stats)).toEqual([]);
  });
});
