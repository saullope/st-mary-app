"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function DashboardTour() {
  useEffect(() => {
    // 2. Configure and instantiate driver.js with the Ludi Dashboard theme
    const driverObj = driver({
      showProgress: true,
      allowClose: true, // ESC key and click on overlay can close for accessibility
      overlayColor: "rgba(29, 21, 58, 0.75)", // Morado Profundo translucent overlay
      popoverClass: "driverjs-dashboard-theme", // Lavender and Success themed popover class
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "¡Entendido!",
      steps: [
        {
          element: "#sidebar-dashboard",
          popover: {
            title: "Tu Centro de Mando",
            description: "Este es tu centro de mando. Desde aquí puedes navegar rápidamente entre tus actividades, reportes y plantillas.",
            side: "right",
            align: "start"
          }
        },
        {
          element: "#dashboard-user-greeting",
          popover: {
            title: "Tu Espacio Personal",
            description: "Tu espacio personal. Aquí siempre verás un resumen rápido de lo que puedes hacer.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#card-create-activity",
          popover: {
            title: "Diseña Experiencias Educativas",
            description: "¡Aquí ocurre la magia! Crea actividades interactivas como Quizzes o Juegos de Memoria en solo unos clics. Es la opción favorita de nuestros educadores.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#card-templates",
          popover: {
            title: "Recursos y Plantillas",
            description: "Ahorra tiempo usando nuestras plantillas o gestiona tus creaciones anteriores de forma fácil.",
            side: "bottom",
            align: "center"
          }
        },
        {
          element: "#dashboard-drafts-section",
          popover: {
            title: "Continuar Trabajando",
            description: "Nunca pierdas tu progreso. Retoma tus borradores exactamente donde los dejaste.",
            side: "top",
            align: "center"
          }
        }
      ],
      onDestroyed: () => {
        // Mark the dashboard tour as completed
        localStorage.setItem("hasSeenDashboardTour", "true");
      }
    });

    // Run the tour with a small delay to ensure page elements and layouts are fully mounted
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}