"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function WelcomeTour() {
  useEffect(() => {
    // 1. Check persistence flag in LocalStorage to fire only on first login
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");
    if (hasCompletedTour === "true") return;

    // 2. Configure and instantiate driver.js with the Ludi theme
    const driverObj = driver({
      showProgress: true,
      allowClose: true, // ESC key and overlay click allowed for accessibility
      overlayColor: "rgba(29, 21, 58, 0.75)", // Morado Profundo overlay with transparency
      popoverClass: "driverjs-theme", // Custom CSS class for styling
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
        // Set persistence flag when closed, skipped, or finished
        localStorage.setItem("hasCompletedTour", "true");
      }
    });

    // Small delay to ensure all DOM elements are fully rendered in next.js client
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}