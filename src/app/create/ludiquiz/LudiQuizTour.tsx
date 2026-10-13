"use client";

import React, { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { useTranslations } from "next-intl";

export default function LudiQuizTour() {
  const driverInstance = useRef<any>(null);
  const { shouldShowTour, markTourAsCompleted, preferences } = useTourPreferences();
  const t = useTranslations("Tours.ludiquiz");

  useEffect(() => {
    const isManuallyTriggered = localStorage.getItem("trigger_tour_ludiquiz_tour") === "true";
    
    if (!isManuallyTriggered && !shouldShowTour('ludiquiz_tour')) return;

    if (isManuallyTriggered) {
      localStorage.removeItem("trigger_tour_ludiquiz_tour");
    }

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
          element: '[data-tour="activity-name"]',
          popover: {
            title: t("name.title"),
            description: t("name.description"),
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="question-input"]',
          popover: {
            title: t("question.title"),
            description: t("question.description"),
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="media-dropzone"]',
          popover: {
            title: t("media.title"),
            description: t("media.description"),
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="answers-section"]',
          popover: {
            title: t("answers.title"),
            description: t("answers.description"),
            side: "top",
            align: "center",
          }
        },
        {
          element: '[data-tour="panel-ludico"]',
          popover: {
            title: t("panel.title"),
            description: t("panel.description"),
            side: "left",
            align: "start",
          },
        }
      ],
      onDestroyed: () => {
        markTourAsCompleted('ludiquiz_tour');
        localStorage.removeItem("ludiquiz_tour_active");
      }
    });

    driverInstance.current = driverObj;

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, [shouldShowTour, markTourAsCompleted, preferences.tourMode, t]);

  return null;
}