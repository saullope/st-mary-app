"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { useTranslations } from "next-intl";

export default function DashboardTour() {
  const { shouldShowTour, markTourAsCompleted, preferences } = useTourPreferences();
  const t = useTranslations("Tours.dashboard");

  useEffect(() => {
    if (!shouldShowTour('dashboard_tour')) return;

    const isHintsMode = preferences.tourMode === 'hints';

    const driverObj = driver({
      showProgress: !isHintsMode,
      allowClose: true,
      overlayColor: isHintsMode ? 'rgba(0, 0, 0, 0)' : 'rgba(29, 21, 58, 0.75)',
      popoverClass: isHintsMode ? 'driverjs-hints-only' : 'driverjs-dashboard-theme',
      animate: !isHintsMode,
      nextBtnText: t("buttons.next"),
      prevBtnText: t("buttons.previous"),
      doneBtnText: t("buttons.done"),
      steps: [
        {
          element: "#sidebar-dashboard",
          popover: {
            title: t("command.title"),
            description: t("command.description"),
            side: "right",
            align: "start"
          }
        },
        {
          element: "#dashboard-user-greeting",
          popover: {
            title: t("personal.title"),
            description: t("personal.description"),
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#card-create-activity",
          popover: {
            title: t("create.title"),
            description: t("create.description"),
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#card-templates",
          popover: {
            title: t("templates.title"),
            description: t("templates.description"),
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#dashboard-drafts-section",
          popover: {
            title: t("drafts.title"),
            description: t("drafts.description"),
            side: "top",
            align: "center"
          }
        }
      ],
      onDestroyed: () => {
        markTourAsCompleted('dashboard_tour');
      }
    });

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [shouldShowTour, markTourAsCompleted, preferences.tourMode, t]);

  return null;
}