// Formato de los archivos del catálogo de plantillas (catalog/*.json) y su paso a
// ActivityData, el mismo que guarda el editor. Sin dependencias de servidor: lo usan
// la sincronización y las pruebas.
import * as yup from "yup";
import type { ActivityData, ActivityType } from "@/services/activityWrite/types";
import type { LessonBlockKind } from "@/features/lesson/lessonBlocks";
import { FORM_QUESTION_TYPES, type FormQuestionType } from "@/features/form/formQuestions";

// "counting": ilustración generada con una cantidad exacta (scripts/templates/counting-art.mjs).
// query describe lo que dibuja: "apple:3 + pear:2", "balloon:4,balloon-popped:2" o "card:3".
export const MEDIA_SOURCES = ["pixabay", "unsplash", "youtube", "counting"] as const;
export type MediaSource = (typeof MEDIA_SOURCES)[number];

/** Imagen o video del catálogo. Sin url está pendiente: lo resuelve scripts/templates/resolve-media.mjs. */
export interface CatalogMedia {
  source: MediaSource;
  query: string;
  url?: string;
  credit?: string;
}

const media = yup
  .object({
    source: yup.string().oneOf([...MEDIA_SOURCES]).required(),
    query: yup.string().trim().min(2).max(120).required(),
    url: yup.string().url().max(600),
    credit: yup.string().max(200),
  })
  .noUnknown();

const TITLE_MAX = 100;
const TEXT_MAX = 300;

const base = {
  code: yup.string().matches(/^[a-z0-9-]{3,80}$/).required(),
  grade: yup.number().oneOf([1, 2, 3]).required(),
  subject: yup.string().matches(/^[a-z-]{3,40}$/).required(),
  collection: yup.string().matches(/^[a-z0-9-]{3,80}$/).required(),
  order: yup.number().integer().min(0).default(0),
  title: yup.string().trim().max(TITLE_MAX).required(),
  durationMin: yup.number().integer().min(1).max(60).required(),
  cover: media.required(),
};

const quizQuestion = yup
  .object({
    text: yup.string().trim().max(TEXT_MAX).required(),
    media: media.default(undefined),
    answers: yup
      .array(yup.object({ text: yup.string().trim().max(120).required(), correct: yup.boolean().default(false) }).noUnknown())
      .min(2)
      .max(4)
      .required()
      .test("one-correct", "exactly one correct answer", (answers) => (answers ?? []).filter((a) => a.correct).length === 1),
  })
  .noUnknown();

const statement = yup
  .object({
    text: yup.string().trim().max(TEXT_MAX).required(),
    answer: yup.boolean().required(),
    media: media.default(undefined),
  })
  .noUnknown();

// Primero y segundo grado solo admiten bloques básicos (ver lessonBlocks.ts); lo revalida el guardado.
const block = yup
  .object({
    kind: yup.string().oneOf(["image", "youtube", "reading"]).required(),
    title: yup.string().trim().max(TEXT_MAX).required(),
    media: media.default(undefined),
    body: yup.string().trim().max(2000),
  })
  .noUnknown()
  .test("block-content", "image/youtube blocks need media, reading blocks need body", (b) =>
    b.kind === "reading" ? Boolean(b.body) : Boolean(b.media),
  );

// LudiForm (solo tercer grado, lo revalida el guardado): las de respuesta larga no llevan opciones
// y las califica el docente; en la de opción única hay exactamente una correcta.
const formQuestion = yup
  .object({
    type: yup.string().oneOf([...FORM_QUESTION_TYPES]).required(),
    text: yup.string().trim().max(TEXT_MAX).required(),
    options: yup
      .array(yup.object({ text: yup.string().trim().max(120).required(), correct: yup.boolean().default(false) }).noUnknown())
      .max(6)
      .default([]),
  })
  .noUnknown()
  .test("form-options", "single: 2+ options and one correct; multiple: 2+ and at least one; long: none", (q) => {
    const options = q.options ?? [];
    const correct = options.filter((o) => o.correct).length;
    if (q.type === "long") return options.length === 0;
    return options.length >= 2 && (q.type === "single" ? correct === 1 : correct >= 1);
  });

export const catalogTemplateSchema = yup.lazy((value: { type?: string }) => {
  switch (value?.type) {
    case "ludiquiz":
      return yup.object({ ...base, type: yup.string().oneOf(["ludiquiz"]).required(), questions: yup.array(quizQuestion).min(3).max(15).required() }).noUnknown();
    case "trueorfalse":
      return yup.object({ ...base, type: yup.string().oneOf(["trueorfalse"]).required(), statements: yup.array(statement).min(3).max(15).required() }).noUnknown();
    case "ludimemory":
      return yup.object({ ...base, type: yup.string().oneOf(["ludimemory"]).required(), images: yup.array(media).min(2).max(12).required() }).noUnknown();
    case "ludileccion":
      return yup.object({ ...base, type: yup.string().oneOf(["ludileccion"]).required(), blocks: yup.array(block).min(1).max(15).required() }).noUnknown();
    case "ludiform":
      return yup.object({ ...base, type: yup.string().oneOf(["ludiform"]).required(), questions: yup.array(formQuestion).min(3).max(15).required() }).noUnknown();
    default:
      return yup.object({ type: yup.string().oneOf(["ludiquiz", "trueorfalse", "ludimemory", "ludileccion", "ludiform"]).required() });
  }
});

export const catalogCollectionSchema = yup
  .object({
    code: base.code,
    grade: base.grade,
    subject: base.subject,
    order: base.order,
    name: yup.string().trim().max(120).required(),
    description: yup.string().trim().max(300).required(),
    cover: media.required(),
  })
  .noUnknown();

interface CatalogBase {
  code: string;
  grade: 1 | 2 | 3;
  subject: string;
  collection: string;
  order: number;
  title: string;
  durationMin: number;
  cover: CatalogMedia;
}

export type CatalogTemplate = CatalogBase &
  (
    | { type: "ludiquiz"; questions: { text: string; media?: CatalogMedia; answers: { text: string; correct: boolean }[] }[] }
    | { type: "trueorfalse"; statements: { text: string; answer: boolean; media?: CatalogMedia }[] }
    | { type: "ludimemory"; images: CatalogMedia[] }
    | { type: "ludileccion"; blocks: { kind: "image" | "youtube" | "reading"; title: string; media?: CatalogMedia; body?: string }[] }
    | { type: "ludiform"; questions: { type: FormQuestionType; text: string; options: { text: string; correct: boolean }[] }[] }
  );

export interface CatalogCollection {
  code: string;
  grade: 1 | 2 | 3;
  subject: string;
  order: number;
  name: string;
  description: string;
  cover: CatalogMedia;
}

/** Todo lo multimedia de una plantilla, para comprobar que ya está resuelto. */
export function templateMedia(entry: CatalogTemplate): CatalogMedia[] {
  const own: (CatalogMedia | undefined)[] = [entry.cover];
  if (entry.type === "ludiquiz") own.push(...entry.questions.map((q) => q.media));
  if (entry.type === "trueorfalse") own.push(...entry.statements.map((s) => s.media));
  if (entry.type === "ludimemory") own.push(...entry.images);
  if (entry.type === "ludileccion") own.push(...entry.blocks.map((b) => b.media));
  return own.filter((item): item is CatalogMedia => Boolean(item));
}

export const isResolved = (item: CatalogMedia) => Boolean(item.url);

// Configuración lúdica por grado: más tiempo y recompensas más sencillas en los primeros
// grados. Los códigos son del catálogo de insignias y misiones (prisma/seeds/achievementCatalog.ts).
const TIME_BY_GRADE: Record<number, number> = { 1: 40, 2: 30, 3: 25 };
const POINTS = 10;

const ACHIEVEMENTS: Record<string, Record<number, { badges: string[]; missions: string[] }>> = {
  quiz: {
    1: { badges: ["sabio", "valiente"], missions: ["1-3-en-raya", "1-20-puntos"] },
    2: { badges: ["sabio", "veloz", "valiente"], missions: ["2-4-en-raya", "2-35-puntos"] },
    3: { badges: ["sabio", "veloz", "agil"], missions: ["3-5-en-raya", "3-rapidez-10s", "3-45-puntos"] },
  },
  memory: {
    1: { badges: ["coleccionista", "imparable"], missions: ["M1-2-parejas", "M1-completo"] },
    2: { badges: ["coleccionista", "imparable", "buena-memoria"], missions: ["M2-3-parejas", "M2-completo"] },
    3: { badges: ["coleccionista", "imparable", "buena-memoria"], missions: ["M3-4-parejas", "M3-3-seguidas", "M3-completo"] },
  },
  form: {
    3: { badges: ["dedicado", "certero", "pensador"], missions: ["F3-3-respuestas", "F3-entrega"] },
  },
  lesson: {
    1: { badges: ["explorador"], missions: ["L1-mitad", "L1-completa"] },
    2: { badges: ["explorador", "atento"], missions: ["L2-mitad", "L2-completa"] },
    3: { badges: ["explorador", "atento", "lector"], missions: ["L3-4-bloques", "L3-completa"] },
  },
};

const CATALOG_BY_TYPE: Record<string, string> = { ludiquiz: "quiz", trueorfalse: "quiz", ludimemory: "memory", ludileccion: "lesson", ludiform: "form" };

export function levelConfig(type: ActivityType, grade: number): ActivityData["config"] {
  const achievements = ACHIEVEMENTS[CATALOG_BY_TYPE[type]][grade];
  return {
    gradeId: grade,
    timeLimit: TIME_BY_GRADE[grade],
    pointsPerCorrect: POINTS,
    selectedBadges: achievements.badges,
    selectedMissions: achievements.missions,
    voiceEnabled: true,
    speedBonus: true,
  };
}

const mediaType = (item: CatalogMedia) => (item.source === "youtube" ? "youtube" : "image");

/** Una entrada del catálogo con su multimedia resuelta, en el formato que guarda el editor. */
export function toActivityData(entry: CatalogTemplate): ActivityData {
  const config = levelConfig(entry.type, entry.grade);
  const common = { title: entry.title, type: entry.type, config, questions: [] } as ActivityData;

  if (entry.type === "ludiquiz") {
    // "detective" premia acertar con imagen o video: solo si las preguntas lo llevan, y desde
    // segundo grado, donde las recompensas ya no son las más sencillas.
    const withMedia = entry.questions.some((q) => q.media);
    return {
      ...common,
      config: withMedia && entry.grade > 1 ? { ...config, selectedBadges: [...config.selectedBadges, "detective"] } : config,
      questions: entry.questions.map((q, index) => ({
        id: index + 1,
        text: q.text,
        mediaType: q.media ? mediaType(q.media) : null,
        mediaUrl: q.media?.url ?? null,
        answers: q.answers.map((a, answerIndex) => ({ id: answerIndex + 1, text: a.text, isCorrect: a.correct })),
      })),
    };
  }
  if (entry.type === "trueorfalse") {
    return {
      ...common,
      questions: entry.statements.map((s, index) => ({
        id: index + 1,
        text: s.text,
        correctAnswer: s.answer ? "true" : "false",
        mediaType: s.media ? mediaType(s.media) : null,
        mediaUrl: s.media?.url ?? null,
      })),
    };
  }
  if (entry.type === "ludimemory") {
    return { ...common, memoryImages: entry.images.map((image) => image.url as string) };
  }
  if (entry.type === "ludiform") {
    return {
      ...common,
      formQuestions: entry.questions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        text: q.text,
        options: q.options.map((o, optionIndex) => ({ id: optionIndex + 1, text: o.text, isCorrect: o.correct })),
      })),
    };
  }
  return {
    ...common,
    lessonBlocks: entry.blocks.map((b, index) => ({
      id: index + 1,
      kind: b.kind as LessonBlockKind,
      title: b.title,
      url: b.kind === "reading" ? null : (b.media?.url ?? null),
      body: b.kind === "reading" ? b.body : undefined,
    })),
  };
}
