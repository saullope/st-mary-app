"use client";

import { useTranslations } from "next-intl";
import type { DriveStep } from "driver.js";
import { useGuidedTour } from "@/features/tours/useGuidedTour";
import { ONBOARDING_JOURNEY } from "@/lib/tours/tourProgress";

// Cada paso apunta a un data-tour del editor; si el elemento no está (p. ej. el modal
// del nombre al editar una actividad existente) driver.js lo muestra centrado.
const STEPS: { key: string; element: string; side: NonNullable<DriveStep["popover"]>["side"] }[] = [
  { key: "name", element: '[data-tour="activity-name"]', side: "bottom" },
  { key: "question", element: '[data-tour="question-input"]', side: "bottom" },
  { key: "answers", element: '[data-tour="answers-section"]', side: "top" },
  { key: "correct", element: '[data-tour="correct-toggle"]', side: "left" },
  { key: "media", element: '[data-tour="media-dropzone"]', side: "bottom" },
  { key: "add", element: '[data-tour="add-question"]', side: "right" },
  { key: "edit", element: '[data-tour="question-list"]', side: "right" },
  { key: "theme", element: '[data-tour="theme-button"]', side: "bottom" },
  { key: "panel", element: '[data-tour="panel-ludico"]', side: "left" },
  { key: "panelGeneral", element: '[data-tour="panel-general"]', side: "left" },
  { key: "panelBadges", element: '[data-tour="panel-badges"]', side: "left" },
  { key: "panelMissions", element: '[data-tour="panel-missions"]', side: "left" },
  { key: "save", element: '[data-tour="save-activity"]', side: "bottom" },
];

export default function LudiQuizTour() {
  const t = useTranslations("Tours.ludiquiz");

  useGuidedTour({
    id: "ludiquiz_tour",
    journey: ONBOARDING_JOURNEY,
    doneText: t("buttons.done"),
    delayMs: 1200,
    steps: STEPS.map(({ key, element, side }) => ({
      element,
      popover: { title: t(`${key}.title`), description: t(`${key}.description`), side, align: "center" },
    })),
  });

  return null;
}
