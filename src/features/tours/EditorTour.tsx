"use client";

import { useTranslations } from "next-intl";
import { useGuidedTour } from "./useGuidedTour";
import { EDITOR_TOURS, type EditorTourType } from "./editorTours";

/** Visita del editor de cada tipo de actividad; se abre desde Configuración > Visitas guiadas. */
export default function EditorTour({ type }: { type: EditorTourType }) {
  const t = useTranslations(`Tours.${type}`);
  const { id, steps } = EDITOR_TOURS[type];

  useGuidedTour({
    id,
    doneText: t("buttons.done"),
    steps: steps.map(({ key, element, side, scrollIntoView }) => ({
      element,
      side,
      scrollIntoView,
      title: t(`${key}.title`),
      description: t(`${key}.description`),
    })),
  });

  return null;
}
