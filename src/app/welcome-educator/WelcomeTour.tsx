"use client";

import { useTranslations } from "next-intl";
import { useGuidedTour } from "@/features/tours/useGuidedTour";
import { ONBOARDING_JOURNEY } from "@/lib/tours/tourProgress";

export default function WelcomeTour() {
  const t = useTranslations("Tours.welcome");

  useGuidedTour({
    id: "welcome_tour",
    journey: ONBOARDING_JOURNEY,
    doneText: t("buttons.done"),
    steps: [
      { element: "#welcome-title", popover: { title: t("hello.title"), description: t("hello.description"), side: "bottom", align: "start" } },
      { element: "#grade-selection-container", popover: { title: t("grade.title"), description: t("grade.description"), side: "bottom", align: "center" } },
      { popover: { title: t("done.title"), description: t("done.description") } },
    ],
  });

  return null;
}
