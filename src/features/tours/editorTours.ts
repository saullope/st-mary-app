// Visitas de los editores (/create/<tipo>). Textos en messages Tours.<tipo>.<clave>.
// Las anclas comunes vienen del kit del editor (EditorSidebar, EditorTypePicker,
// EditorCanvas), del Panel Lúdico y de la barra superior.
import type { TourSide } from "./tourStep";

export type EditorTourType = "ludiquiz" | "trueorfalse" | "ludimemory" | "ludileccion" | "ludiform";

export interface EditorTourStep {
  key: string;
  element: string;
  side: TourSide;
  scrollIntoView?: boolean;
}

const tour = (id: string): string => `[data-tour="${id}"]`;

// Cierre común: tema, recompensas y guardar.
const theme: EditorTourStep = { key: "theme", element: tour("theme-button"), side: "bottom" };
const panelGeneral: EditorTourStep = { key: "panelGeneral", element: tour("panel-general"), side: "left", scrollIntoView: true };
const panelBadges: EditorTourStep = { key: "panelBadges", element: tour("panel-badges"), side: "left", scrollIntoView: true };
const panelMissions: EditorTourStep = { key: "panelMissions", element: tour("panel-missions"), side: "left", scrollIntoView: true };
const save: EditorTourStep = { key: "save", element: tour("save-activity"), side: "bottom" };

export const EDITOR_TOURS: Record<EditorTourType, { id: string; steps: EditorTourStep[] }> = {
  ludiquiz: {
    id: "ludiquiz_tour",
    steps: [
      { key: "question", element: tour("question-input"), side: "bottom" },
      { key: "answers", element: tour("answers-section"), side: "top" },
      { key: "correct", element: tour("correct-toggle"), side: "left" },
      { key: "media", element: tour("media-dropzone"), side: "bottom" },
      { key: "add", element: tour("add-question"), side: "right" },
      { key: "edit", element: tour("question-list"), side: "right" },
      theme,
      { key: "panel", element: tour("panel-ludico"), side: "left" },
      panelGeneral,
      panelBadges,
      panelMissions,
      save,
    ],
  },
  trueorfalse: {
    id: "trueorfalse_tour",
    steps: [
      { key: "statement", element: tour("question-input"), side: "bottom" },
      { key: "answer", element: tour("truefalse-answer"), side: "top" },
      { key: "add", element: tour("add-question"), side: "right" },
      { key: "list", element: tour("editor-sidebar"), side: "right" },
      theme,
      panelGeneral,
      panelBadges,
      save,
    ],
  },
  ludimemory: {
    id: "ludimemory_tour",
    steps: [
      { key: "board", element: tour("editor-canvas"), side: "right" },
      theme,
      panelGeneral,
      panelBadges,
      save,
    ],
  },
  ludileccion: {
    id: "ludileccion_tour",
    steps: [
      { key: "addBlock", element: tour("add-item"), side: "right" },
      { key: "list", element: tour("editor-sidebar"), side: "right" },
      { key: "canvas", element: tour("editor-canvas"), side: "left" },
      theme,
      panelBadges,
      save,
    ],
  },
  ludiform: {
    id: "ludiform_tour",
    steps: [
      { key: "addQuestion", element: tour("add-item"), side: "right" },
      { key: "list", element: tour("editor-sidebar"), side: "right" },
      { key: "canvas", element: tour("editor-canvas"), side: "left" },
      theme,
      panelGeneral,
      panelBadges,
      save,
    ],
  },
};
