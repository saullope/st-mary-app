import { BADGES, MISSIONS } from "../../../../prisma/seeds/achievementCatalog";
import { SUBJECTS } from "../../../../prisma/seeds/subjectCatalog";
import { validateLessonForSave } from "@/features/lesson/lessonBlocks";
import { validateMemoryForSave } from "@/features/memory/memoryCards";
import { catalogCollections, catalogTemplates } from "../catalog";
import {
  catalogCollectionSchema,
  catalogTemplateSchema,
  isResolved,
  templateMedia,
  toActivityData,
  type CatalogCollection,
  type CatalogTemplate,
} from "../catalogSchema";

// El catálogo es contenido versionado: estas pruebas son la revisión automática antes de
// sincronizarlo (lo humano, como que un video sea adecuado, queda para el docente).
const templates = catalogTemplates.map((raw) => catalogTemplateSchema.validateSync(raw, { abortEarly: false }) as unknown as CatalogTemplate);
const collections = catalogCollections.map((raw) => catalogCollectionSchema.validateSync(raw, { abortEarly: false }) as CatalogCollection);
const subjectsByCode = new Map(SUBJECTS.map((subject) => [subject.codigo, subject]));

describe("template catalog", () => {
  it("has unique codes", () => {
    const codes = [...templates.map((t) => t.code), ...collections.map((c) => c.code)];
    expect(new Set(codes).size).toBe(codes.length);
  });

  it.each(templates.map((t) => [t.code, t] as const))("%s is ready to sync", (_code, template) => {
    // Clase que existe y se ofrece en ese grado, y una colección del mismo grado y clase.
    expect(subjectsByCode.get(template.subject)?.grados).toContain(template.grade);
    const collection = collections.find((c) => c.code === template.collection);
    expect(collection).toMatchObject({ grade: template.grade, subject: template.subject });

    // Toda la multimedia resuelta (scripts/templates/resolve-media.mjs) y con créditos.
    for (const item of templateMedia(template)) {
      expect(isResolved(item)).toBe(true);
      expect(item.credit).toBeTruthy();
    }

    // Las mismas reglas que el guardado del editor.
    const data = toActivityData(template);
    if (data.type === "ludileccion") expect(validateLessonForSave(data.lessonBlocks, template.grade)).toBeNull();
    if (data.type === "ludimemory") expect(validateMemoryForSave(data.memoryImages)).toBeNull();
    if (data.type === "ludiquiz") {
      for (const question of data.questions) {
        expect((question as { answers: { isCorrect: boolean }[] }).answers.filter((a) => a.isCorrect)).toHaveLength(1);
      }
    }

    // Insignias y misiones del catálogo de logros, del tipo y del grado correctos.
    const catalogKey = { ludiquiz: "quiz", trueorfalse: "quiz", ludimemory: "memory", ludileccion: "lesson" }[template.type];
    for (const code of data.config.selectedBadges) {
      expect(BADGES.find((b) => b.codigo === code)?.catalogo).toBe(catalogKey);
    }
    for (const code of data.config.selectedMissions) {
      expect(MISSIONS.find((m) => m.codigo === code)).toMatchObject({ catalogo: catalogKey, gradoId: template.grade });
    }
  });

  // Contar con una foto de stock confunde: no garantiza cuántas cosas muestra (ni qué hora marca
  // un reloj). Lo que pide contar, calcular o leer la hora lleva una ilustración "counting"
  // con el valor exacto, o ninguna.
  it("counting and arithmetic items only use exact-count illustrations", () => {
    // "Cuéntalos", "contemos"... pero no "cuento" (un cuento no pide contar).
    const COUNTING = /cu[aá]nt[oa]s?\b|\d\s*[+−-]\s*\d|\bquedan?\b|en total|cuént[ao]l|\bcontar\b|\bcontemos\b|compro|me regalan|llegan|reloj|qu[eé] hora/i;
    const STOCK = new Set(["pixabay", "unsplash"]);
    for (const template of templates) {
      const items =
        template.type === "ludiquiz" ? template.questions.map((q) => [q.text, q.media] as const)
        : template.type === "trueorfalse" ? template.statements.map((s) => [s.text, s.media] as const)
        : template.type === "ludileccion" ? template.blocks.map((b) => [b.title, b.media] as const)
        : [];
      for (const [text, media] of items) {
        if (media && STOCK.has(media.source) && COUNTING.test(text)) expect({ code: template.code, text, source: media.source }).toMatchObject({ source: "counting" });
      }
    }
  });

  it("every collection has templates and a resolved cover", () => {
    for (const collection of collections) {
      expect(templates.some((t) => t.collection === collection.code)).toBe(true);
      expect(isResolved(collection.cover)).toBe(true);
    }
  });
});
