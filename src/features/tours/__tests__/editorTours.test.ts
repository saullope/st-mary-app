import es from "../../../../messages/es.json";
import en from "../../../../messages/en.json";
import { EDITOR_TOURS } from "../editorTours";
import { TOUR_REGISTRY } from "@/lib/tours/tourRegistry";

type Texts = Record<string, { title?: string; description?: string; done?: string }>;

describe("editor tours", () => {
  it.each(Object.entries(EDITOR_TOURS))("%s: every step points to a data-tour attribute and has its texts", (type, { steps }) => {
    for (const { element, key } of steps) {
      expect(element).toMatch(/^\[data-tour="[a-z-]+"\]$/);
      for (const messages of [es, en]) {
        const texts = (messages.Tours as unknown as Record<string, Texts>)[type];
        expect(texts?.[key]?.title).toBeTruthy();
        expect(texts?.[key]?.description).toBeTruthy();
        expect(texts?.buttons?.done).toBeTruthy();
      }
    }
  });

  it("every editor tour can be opened from Settings", () => {
    for (const [type, { id }] of Object.entries(EDITOR_TOURS)) {
      expect(TOUR_REGISTRY.find((tour) => tour.id === id)?.route).toBe(`/create/${type}`);
    }
  });

  it("keeps the activity names untranslated", () => {
    for (const messages of [es, en]) {
      expect(Object.values(messages.Common.activityTypes)).toEqual(["LudiQuiz", "TrueOrFalse", "LudiMemory", "LudiLección", "LudiForm"]);
    }
  });
});
