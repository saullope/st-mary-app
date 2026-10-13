import { aggregateFollowUp, sortFollowUpRows, summarizeStudentFeedback, OBJECTIVE_LEVELS, type FollowUpSession } from "../followUp";

const session = (overrides: Partial<FollowUpSession>): FollowUpSession => ({
  groupActivityId: 1,
  groupActivityName: "Conozcamos las formas",
  fromTemplate: false,
  activityType: "LudiQuiz",
  gradeId: 1,
  gradeName: "Primero",
  teacherId: "docente-a",
  teacherRating: null,
  objectiveLevel: null,
  templateDifficulty: null,
  participants: [],
  ...overrides,
});

describe("summarizeStudentFeedback", () => {
  it("promedia solo a quienes respondieron las dos preguntas", () => {
    const summary = summarizeStudentFeedback([
      { studentEnjoyment: 5, studentLearning: 4 },
      { studentEnjoyment: 3, studentLearning: 2 },
      { studentEnjoyment: 1, studentLearning: null },
      { studentEnjoyment: null, studentLearning: null },
    ]);
    expect(summary).toEqual({ avgEnjoyment: 4, avgLearning: 3, responses: 2, participants: 4 });
  });

  it("sin respuestas no inventa un promedio", () => {
    expect(summarizeStudentFeedback([{ studentEnjoyment: null, studentLearning: null }]).avgEnjoyment).toBeNull();
  });
});

describe("aggregateFollowUp", () => {
  it("agrupa por actividad y grado, con las copias de una plantilla y sus distintos docentes", () => {
    const rows = aggregateFollowUp([
      session({ fromTemplate: true, teacherId: "docente-a", teacherRating: 5, objectiveLevel: OBJECTIVE_LEVELS.yes, participants: [{ studentEnjoyment: 5, studentLearning: 5 }] }),
      session({ fromTemplate: true, teacherId: "docente-b", teacherRating: 3, objectiveLevel: OBJECTIVE_LEVELS.partial, participants: [{ studentEnjoyment: 3, studentLearning: 4 }] }),
      session({ teacherId: "docente-b" }),
      session({ gradeId: 2, gradeName: "Segundo", teacherRating: 2, objectiveLevel: OBJECTIVE_LEVELS.no }),
    ]);

    expect(rows).toHaveLength(2);
    const firstGrade = rows.find((r) => r.gradeId === 1)!;
    expect(firstGrade).toMatchObject({
      activityName: "Conozcamos las formas",
      fromTemplate: true,
      sessions: 3,
      evaluatedSessions: 2,
      teachers: 2,
      avgEffectiveness: 4,
      objectiveMetPct: 50,
      objectivePartialPct: 50,
      avgEnjoyment: 4,
      avgLearning: 4.5,
      studentResponses: 2,
    });
    expect(rows.find((r) => r.gradeId === 2)).toMatchObject({ evaluatedSessions: 1, objectiveMetPct: 0, avgEnjoyment: null });
  });

  it("el porcentaje de objetivo se calcula sobre las sesiones que lo respondieron", () => {
    const [row] = aggregateFollowUp([session({ teacherRating: 4, objectiveLevel: OBJECTIVE_LEVELS.yes }), session({})]);
    expect(row.objectiveMetPct).toBe(100);
    expect(row.evaluatedSessions).toBe(1);
  });
});

describe("sortFollowUpRows", () => {
  const rows = aggregateFollowUp([
    session({ groupActivityId: 1, groupActivityName: "B", teacherRating: 3, objectiveLevel: 2 }),
    session({ groupActivityId: 2, groupActivityName: "A", teacherRating: 5, objectiveLevel: 2 }),
    session({ groupActivityId: 3, groupActivityName: "C" }),
  ]);

  it("ordena por efectividad y deja al final las actividades sin evaluar", () => {
    expect(sortFollowUpRows(rows, "avgEffectiveness", "desc").map((r) => r.activityName)).toEqual(["A", "B", "C"]);
    expect(sortFollowUpRows(rows, "avgEffectiveness", "asc").map((r) => r.activityName)).toEqual(["B", "A", "C"]);
  });

  it("ordena por nombre sin modificar el arreglo original", () => {
    expect(sortFollowUpRows(rows, "activityName", "asc").map((r) => r.activityName)).toEqual(["A", "B", "C"]);
    expect(rows.map((r) => r.activityName)).toEqual(["B", "A", "C"]);
  });
});
