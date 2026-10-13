"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { useTranslations } from "next-intl";

export default function WelcomeTour() {
  const { shouldShowTour, markTourAsCompleted, preferences } = useTourPreferences();
  const t = useTranslations("Tours.welcome");

  useEffect(() => {
    if (!shouldShowTour('welcome_tour')) return;

    const isHintsMode = preferences.tourMode === 'hints';

    const driverObj = driver({
      showProgress: !isHintsMode,
      allowClose: true,
      overlayColor: isHintsMode ? 'rgba(0, 0, 0, 0)' : 'rgba(29, 21, 58, 0.75)',
      popoverClass: isHintsMode ? 'driverjs-hints-only' : 'driverjs-theme',
      animate: !isHintsMode,
      nextBtnText: t("buttons.next"),
      prevBtnText: t("buttons.previous"),
      doneBtnText: t("buttons.done"),
      steps: [
        {
          element: "#welcome-title",
          popover: {
            title: t("hello.title"),
            description: t("hello.description"),
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#grade-selection-container",
          popover: {
            title: t("grade.title"),
            description: t("grade.description"),
            side: "bottom",
            align: "center"
          }
        },
        {
          popover: {
            title: t("done.title"),
            description: t("done.description"),
          }
        }
      ],
      onDestroyed: () => {
        markTourAsCompleted('welcome_tour');
      }
    });

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, [shouldShowTour, markTourAsCompleted, preferences.tourMode, t]);

  return null;
}