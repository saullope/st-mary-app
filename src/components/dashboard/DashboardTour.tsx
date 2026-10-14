"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useGuidedTour } from "@/features/tours/useGuidedTour";
import { ONBOARDING_JOURNEY } from "@/lib/tours/tourProgress";

export default function DashboardTour() {
  const router = useRouter();
  const t = useTranslations("Tours.dashboard");

  useGuidedTour({
    id: "dashboard_tour",
    journey: ONBOARDING_JOURNEY,
    doneText: t("buttons.toCreate"),
    // El recorrido sigue en Crear actividad, donde se abre la visita siguiente.
    onComplete: () => router.push("/dashboard/create-activity"),
    steps: [
      { element: "#sidebar-dashboard", popover: { title: t("command.title"), description: t("command.description"), side: "right", align: "start" } },
      { element: "#dashboard-user-greeting", popover: { title: t("personal.title"), description: t("personal.description"), side: "bottom", align: "center" } },
      { element: "#card-create-activity", popover: { title: t("create.title"), description: t("create.description"), side: "bottom", align: "center" } },
      { element: "#card-templates", popover: { title: t("templates.title"), description: t("templates.description"), side: "bottom", align: "center" } },
      { element: "#card-my-activities", popover: { title: t("myActivities.title"), description: t("myActivities.description"), side: "bottom", align: "center" } },
      { element: "#dashboard-drafts-section", popover: { title: t("drafts.title"), description: t("drafts.description"), side: "top", align: "center" } },
      { element: "#card-create-activity", popover: { title: t("next.title"), description: t("next.description"), side: "bottom", align: "center" } },
    ],
  });

  return null;
}
