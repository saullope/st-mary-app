"use client";

import { useTranslations } from "next-intl";
import { useGuidedTour } from "@/features/tours/useGuidedTour";

export default function CreateActivityTour() {
  const t = useTranslations("Tours.createActivity");

  useGuidedTour({
    id: "create_activity_tour",
    doneText: t("buttons.done"),
    steps: [
      { element: '[data-tour="activity-types"]', side: "top", title: t("types.title"), description: t("types.description") },
      { element: '[data-tour="ludiquiz-card"]', side: "bottom", title: t("ludiquiz.title"), description: t("ludiquiz.description") },
    ],
  });

  return null;
}
