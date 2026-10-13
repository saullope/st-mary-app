"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTourPreferences } from "@/hooks/useTourPreferences";

export default function WelcomeTour() {
  const { shouldShowTour, markTourAsCompleted, preferences } = useTourPreferences();

  useEffect(() => {
    if (!shouldShowTour('welcome_tour')) return;

    const isHintsMode = preferences.tourMode === 'hints';

    const driverObj = driver({
      showProgress: !isHintsMode,
      allowClose: true,
      overlayColor: isHintsMode ? 'rgba(0, 0, 0, 0)' : 'rgba(29, 21, 58, 0.75)',
      popoverClass: isHintsMode ? 'driverjs-hints-only' : 'driverjs-theme',
      animate: !isHintsMode,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡A crear!",
      steps: [
        {
          element: "#welcome-title",
          popover: {
            title: "¡Bienvenido Educador!",
            description: "¡Hola! Estamos felices de tenerte aquí. Vamos a preparar tu espacio de trabajo.",
            side: "bottom",
            align: "start"
          }
        },
        {
          element: "#grade-selection-container",
          popover: {
            title: "Elige tu Grado",
            description: "Selecciona el grado con el que trabajarás. Esto nos permitirá mostrarte recursos personalizados solo para tus alumnos.",
            side: "bottom",
            align: "center"
          }
        },
        {
          popover: {
            title: "¡Excelente elección!",
            description: "¡Excelente elección! Al seleccionar, entrarás directamente a tu dashboard personalizado. ¡A crear!",
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
  }, [shouldShowTour, markTourAsCompleted, preferences.tourMode]);

  return null;
}