"use client";

import { useTranslations } from "next-intl";
import { useGuidedTour } from "@/features/tours/useGuidedTour";

const STEPS = [
  { key: "command", element: '[data-tour="sidebar"]', side: "right" },
  { key: "personal", element: '[data-tour="greeting"]', side: "bottom" },
  { key: "create", element: '[data-tour="card-create-activity"]', side: "bottom" },
  { key: "templates", element: '[data-tour="card-templates"]', side: "bottom" },
  { key: "myActivities", element: '[data-tour="card-my-activities"]', side: "bottom" },
  { key: "drafts", element: '[data-tour="drafts"]', side: "top" },
] as const;

export default function DashboardTour() {
  const t = useTranslations("Tours.dashboard");

  useGuidedTour({
    id: "dashboard_tour",
    doneText: t("buttons.done"),
    steps: STEPS.map(({ key, element, side }) => ({ element, side, title: t(`${key}.title`), description: t(`${key}.description`) })),
  });

  return null;
}
