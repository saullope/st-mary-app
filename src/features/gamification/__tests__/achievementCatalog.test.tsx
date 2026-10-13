import fs from "fs";
import path from "path";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import es from "../../../../messages/es.json";
import en from "../../../../messages/en.json";
import { BADGES, MISSIONS } from "../../../../prisma/seeds/achievementCatalog";
import { KNOWN_RULES, evaluateBadges, evaluateMissions, type GameplayStats } from "../achievementRules";
import { badgesFor, catalogKeyForActivity, catalogKeyForTipo, missionsFor, pickSelected } from "../catalog";
import { useAchievementText } from "../useAchievementText";
import { badgeDefs, missionDefs, testCatalog } from "../testing/catalogFixture";

type Messages = typeof es;
const lookup = (messages: Messages, keyPath: string) =>
  keyPath.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], messages.Achievements);

describe("catálogo de logros (seed de la BD)", () => {
  it("usa solo reglas que el motor conoce", () => {
    BADGES.forEach((b) => expect(KNOWN_RULES.badges).toContain(b.regla));
    MISSIONS.forEach((m) => expect(KNOWN_RULES.missions).toContain(m.regla));
  });

  it("cada insignia tiene su ilustración en public/", () => {
    BADGES.forEach((b) => expect(fs.existsSync(path.join(process.cwd(), "public", b.imagen))).toBe(true));
  });

  it.each([["es", es], ["en", en]] as const)("tiene todos los textos en %s", (_locale, messages) => {
    BADGES.forEach((b) => {
      ["name", "phrase", "description"].forEach((field) => expect(lookup(messages, `badges.${b.codigo}.${field}`)).toEqual(expect.any(String)));
    });
    MISSIONS.forEach((m) => {
      ["text", "studentText"].forEach((field) => expect(lookup(messages, `missions.${m.catalogo}.${m.regla}.${field}`)).toEqual(expect.any(String)));
    });
  });

  it("los códigos no se repiten (son los que guardan los logros otorgados)", () => {
    expect(new Set(BADGES.map((b) => b.codigo)).size).toBe(BADGES.length);
    expect(new Set(MISSIONS.map((m) => m.codigo)).size).toBe(MISSIONS.length);
  });
});

describe("selección por actividad y grado", () => {
  it("LudiQuiz y Verdadero/Falso comparten catálogo; el resto tiene el suyo", () => {
    expect(catalogKeyForActivity("trueorfalse")).toBe("quiz");
    expect(catalogKeyForTipo(3)).toBe("memory");
    expect(badgesFor(testCatalog, "lesson").map((b) => b.code)).toEqual(["explorador", "atento", "lector"]);
  });

  it("solo cuenta lo elegido que existe en el catálogo del grado", () => {
    const grade2 = missionsFor(testCatalog, "quiz", 2);
    expect(pickSelected(grade2, ["2-4-en-raya", "1-3-en-raya", "borrada"]).map((m) => m.code)).toEqual(["2-4-en-raya"]);
  });
});

describe("reglas de LudiQuiz con umbrales de la BD", () => {
  const stats = (overrides: Partial<GameplayStats>): GameplayStats => ({
    timeLimitMs: 20000, streak: 0, totalCorrect: 0, totalAnswered: 0, totalScore: 0, hasFailedOnce: false,
    lastAnswerCorrect: false, lastAnswerHadMedia: false, lastAnswerTimeMs: 0, avgAnswerTimeMs: 0, isFinished: false,
    ...overrides,
  });

  it("veloz usa el porcentaje del tiempo límite configurado", () => {
    const veloz = badgeDefs("veloz");
    expect(evaluateBadges(veloz, new Set(), stats({ lastAnswerCorrect: true, totalCorrect: 1, lastAnswerTimeMs: 8000 }))).toEqual(["veloz"]);
    expect(evaluateBadges(veloz, new Set(), stats({ lastAnswerCorrect: true, totalCorrect: 1, lastAnswerTimeMs: 9000 }))).toEqual([]);
  });

  it("mente creativa es manual: nunca se otorga sola", () => {
    expect(evaluateBadges(badgeDefs("mente-creativa"), new Set(), stats({ lastAnswerCorrect: true, totalCorrect: 1, isFinished: true }))).toEqual([]);
  });

  it("la misión de puntos de 2.º grado se cumple con los 30 que anuncia", () => {
    expect(evaluateMissions(missionDefs("2-35-puntos"), new Set(), stats({ totalScore: 30 }))).toEqual(["2-35-puntos"]);
  });

  it("no repite logros ya otorgados", () => {
    expect(evaluateMissions(missionDefs("1-3-en-raya"), new Set(["1-3-en-raya"]), stats({ streak: 5 }))).toEqual([]);
  });
});

describe("textos traducidos", () => {
  const Probe = () => {
    const text = useAchievementText();
    const [imparable] = badgeDefs("imparable");
    const [racha] = missionDefs("3-5-en-raya");
    return (
      <p>
        {text.badge(imparable).name} | {text.badge(imparable).description} | {text.mission(racha).text}
      </p>
    );
  };

  it.each([
    ["es", es, "Imparable | Para quienes encuentran 3 parejas seguidas sin fallar. | Responde 5 preguntas correctas seguidas"],
    ["en", en, "Unstoppable | For students who find 3 pairs in a row without a miss. | Answer 5 questions correctly in a row"],
  ] as const)("usa el idioma activo (%s) y el umbral de la BD", (locale, messages, expected) => {
    render(<NextIntlClientProvider locale={locale} messages={messages}><Probe /></NextIntlClientProvider>);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
