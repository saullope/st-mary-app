import { createFormQuestion, gradeFormAnswer, isAnswered, validateFormForSave, type FormQuestion, type GradableQuestion } from "../formQuestions";
import { evaluateFormBadges, evaluateFormMissions, type FormProgressStats } from "@/features/gamification/achievementRules";

const single: FormQuestion = {
  id: 1,
  type: "single",
  text: "¿Capital de Francia?",
  options: [
    { id: 1, text: "París", isCorrect: true },
    { id: 2, text: "Roma", isCorrect: false },
  ],
};

describe("validación del formulario", () => {
  it("solo se puede guardar en tercer grado", () => {
    expect(validateFormForSave([single], 2)).toMatch(/tercer grado/);
    expect(validateFormForSave([single], 3)).toBeNull();
  });

  it("opción única exige exactamente una correcta", () => {
    const twoCorrect = { ...single, options: single.options.map((o) => ({ ...o, isCorrect: true })) };
    expect(validateFormForSave([twoCorrect], 3)).toMatch(/Solo una opción/);
    const none = { ...single, options: single.options.map((o) => ({ ...o, isCorrect: false })) };
    expect(validateFormForSave([none], 3)).toMatch(/Marca la opción correcta/);
  });

  it("la respuesta larga solo exige enunciado", () => {
    const long = { ...createFormQuestion(2, "long"), text: "Explica la fotosíntesis" };
    expect(long.options).toEqual([]);
    expect(validateFormForSave([long], 3)).toBeNull();
    expect(validateFormForSave([{ ...long, text: " " }], 3)).toMatch(/Pregunta 1: Escribe el enunciado/);
  });
});

describe("calificación", () => {
  const multiple: GradableQuestion = {
    id: "10",
    type: "multiple",
    options: [
      { id: "1", esCorrecta: true },
      { id: "2", esCorrecta: true },
      { id: "3", esCorrecta: false },
    ],
  };

  it("selección múltiple exige marcar exactamente las correctas", () => {
    expect(gradeFormAnswer(multiple, { preguntaId: "10", optionIds: ["1", "2"] }, 10)).toEqual({ status: "correct", points: 10 });
    expect(gradeFormAnswer(multiple, { preguntaId: "10", optionIds: ["1"] }, 10).status).toBe("incorrect");
    expect(gradeFormAnswer(multiple, { preguntaId: "10", optionIds: ["1", "2", "3"] }, 10).status).toBe("incorrect");
  });

  it("opción única acierta con la opción correcta", () => {
    const q: GradableQuestion = { id: "5", type: "single", options: [{ id: "7", esCorrecta: false }, { id: "8", esCorrecta: true }] };
    expect(gradeFormAnswer(q, { preguntaId: "5", optionIds: ["8"] }, 15)).toEqual({ status: "correct", points: 15 });
    expect(gradeFormAnswer(q, { preguntaId: "5", optionIds: ["7"] }, 15)).toEqual({ status: "incorrect", points: 0 });
  });

  it("la respuesta larga queda pendiente y debe tener texto", () => {
    const q: GradableQuestion = { id: "9", type: "long", options: [] };
    expect(gradeFormAnswer(q, { preguntaId: "9", text: "Mi respuesta" }, 10)).toEqual({ status: "pending", points: 0 });
    expect(isAnswered(q, { preguntaId: "9", text: "   " })).toBe(false);
  });
});

describe("logros de formulario", () => {
  const base: FormProgressStats = {
    answeredCount: 0,
    maxLongAnswerWords: 0,
    minLongAnswerWords: null,
    closedTotal: 2,
    closedCorrect: 0,
    submitted: false,
  };
  const missions = ["F3-3-respuestas", "F3-escritor", "F3-entrega"];

  it("las misiones avanzan mientras se responde", () => {
    expect(evaluateFormMissions(missions, 3, new Set(), { ...base, answeredCount: 3 })).toEqual(["F3-3-respuestas"]);
    expect(evaluateFormMissions(missions, 3, new Set(), { ...base, maxLongAnswerWords: 25 })).toEqual(["F3-escritor"]);
    expect(evaluateFormMissions(missions, 3, new Set(), { ...base, submitted: true })).toEqual(["F3-entrega"]);
  });

  it("no hay misiones de formulario fuera de tercer grado", () => {
    expect(evaluateFormMissions(missions, 1, new Set(), { ...base, answeredCount: 5, submitted: true })).toEqual([]);
  });

  it("las insignias se otorgan al entregar según el resultado", () => {
    const badges = ["dedicado", "certero", "pensador"];
    expect(evaluateFormBadges(badges, new Set(), base)).toEqual([]);
    const submitted = { ...base, submitted: true, closedCorrect: 2, minLongAnswerWords: 22 };
    expect(evaluateFormBadges(badges, new Set(), submitted)).toEqual(["dedicado", "certero", "pensador"]);
    expect(evaluateFormBadges(badges, new Set(), { ...submitted, closedCorrect: 1, minLongAnswerWords: 5 })).toEqual(["dedicado"]);
  });
});
