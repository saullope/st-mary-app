"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { useTranslations } from "next-intl";

export default function CreateActivityTour() {
  const { shouldShowTour, markTourAsCompleted, preferences } = useTourPreferences();
  const t = useTranslations("Tours.createActivity");

  useEffect(() => {
    const isManuallyTriggered = localStorage.getItem("trigger_tour_create_activity_tour") === "true";
    
    if (!isManuallyTriggered && !shouldShowTour('create_activity_tour')) return;

    if (isManuallyTriggered) {
      localStorage.removeItem("trigger_tour_create_activity_tour");
    }

    const isHintsMode = preferences.tourMode === 'hints';

    const driverObj = driver({
      showProgress: false,
      allowClose: isHintsMode,
      overlayColor: isHintsMode ? 'rgba(0, 0, 0, 0)' : 'rgba(29, 21, 58, 0.75)',
      popoverClass: isHintsMode ? 'driverjs-hints-only' : 'driverjs-dashboard-theme',
      animate: !isHintsMode,
      steps: [
        {
          element: '[data-tour="ludiquiz-card"]',
          popover: {
            title: t("ludiquiz.title"),
            description: t("ludiquiz.description"),
            side: "bottom",
            align: "center",
          }
        }
      ],
      onDestroyed: () => {
        markTourAsCompleted('create_activity_tour');
      }
    });

    const timer = setTimeout(() => {
      const card = document.querySelector('[data-tour="ludiquiz-card"]');
      if (card) {
        card.addEventListener("click", () => {
          localStorage.setItem("ludiquiz_tour_active", "true");
          localStorage.setItem("ludiquiz_tour_step", "2");
          // El editor abre en otra pestaña; sin esto el overlay queda bloqueando esta.
          driverObj.destroy();
        });
      }

      driverObj.drive();

      const nextBtn = document.querySelector(".driver-popover-next-btn") as HTMLElement;
      if (nextBtn) {
        nextBtn.style.display = "none";
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [shouldShowTour, markTourAsCompleted, preferences.tourMode, t]);

  return null;
}