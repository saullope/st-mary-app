"use client";

import { useTranslations } from "next-intl";
import { useGuidedTour } from "@/features/tours/useGuidedTour";
import { ONBOARDING_JOURNEY } from "@/lib/tours/tourProgress";

export default function CreateActivityTour() {
  const t = useTranslations("Tours.createActivity");

  useGuidedTour({
    id: "create_activity_tour",
    journey: ONBOARDING_JOURNEY,
    doneText: t("buttons.done"),
    steps: [
      { element: "#create-activity-cards", popover: { title: t("types.title"), description: t("types.description"), side: "top", align: "center" } },
      // El editor se abre en otra pestaña y allí continúa la visita de LudiQuiz.
      { element: '[data-tour="ludiquiz-card"]', popover: { title: t("ludiquiz.title"), description: t("ludiquiz.description"), side: "bottom", align: "center" } },
    ],
  });

  return null;
}
