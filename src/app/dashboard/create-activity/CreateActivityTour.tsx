"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function CreateActivityTour() {
  useEffect(() => {
    // Check if the user has already completed the ludiquiz tour
    const completed = localStorage.getItem("ludiquiz_tour_completed");
    if (completed === "true") return;

    const driverObj = driver({
      showProgress: false,
      allowClose: false, // Strict blocking sequential tour
      overlayColor: "rgba(29, 21, 58, 0.75)",
      popoverClass: "driverjs-dashboard-theme",
      steps: [
        {
          element: '[data-tour="ludiquiz-card"]',
          popover: {
            title: "¡LudiQuiz!",
            description: "¡Bienvenido al creador de actividades! Para comenzar a diseñar tu cuestionario interactivo, haz clic aquí en LudiQuiz.",
            side: "bottom",
            align: "center",
          }
        }
      ]
    });

    // Start tour
    const timer = setTimeout(() => {
      // Find LudiQuiz card and add click event listener to continue the tour
      const card = document.querySelector('[data-tour="ludiquiz-card"]');
      if (card) {
        card.addEventListener("click", () => {
          localStorage.setItem("ludiquiz_tour_active", "true");
          localStorage.setItem("ludiquiz_tour_step", "2");
        });
      }

      driverObj.drive();

      // Hiding Next button for step 1
      const nextBtn = document.querySelector(".driver-popover-next-btn") as HTMLElement;
      if (nextBtn) {
        nextBtn.style.display = "none";
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return null;
}