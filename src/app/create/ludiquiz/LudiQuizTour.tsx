"use client";

import React, { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function LudiQuizTour() {
  const driverInstance = useRef<any>(null);

  useEffect(() => {
    // Check if the tour is triggered from the card click
    const isTourActive = localStorage.getItem("ludiquiz_tour_active") === "true";
    if (!isTourActive) return;

    const driverObj = driver({
      showProgress: true,
      allowClose: true, // Allow skip/close at any time for maximum ease
      overlayColor: "rgba(29, 21, 58, 0.75)",
      popoverClass: "driverjs-dashboard-theme",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      steps: [
        {
          element: '[data-tour="activity-name"]',
          popover: {
            title: "Nombre de la Actividad",
            description: "El primer paso es darle identidad a tu juego. Introduce un nombre claro y descriptivo para tu LudiQuiz aquí.",
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="question-input"]',
          popover: {
            title: "Enunciado de la Pregunta",
            description: "¡Excelente! Ahora estás en el editor central. Utiliza este espacio para redactar el enunciado o la pregunta que deberán responder tus estudiantes.",
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="media-dropzone"]',
          popover: {
            title: "Carga de Archivos Multimedia",
            description: "Haz tus preguntas más dinámicas. Desde esta zona puedes cargar imágenes, audios o recursos multimedia complementarios para la pregunta.",
            side: "bottom",
            align: "center",
          }
        },
        {
          element: '[data-tour="answers-section"]',
          popover: {
            title: "Ingreso de Respuestas",
            description: "Define aquí las posibles respuestas del cuestionario. Es obligatorio que ingreses el texto y marques el radio-button o checkbox de la opción que sea correcta antes de continuar.",
            side: "top",
            align: "center",
          }
        },
        {
          element: '[data-tour="panel-ludico"]',
          popover: {
            title: "Panel Lúdico y Configuración",
            description: "Por último, despliega el Panel Lúdico. Aquí podrás seleccionar los elementos de gamificación (vidas, comodines, avatares), ajustar el tiempo límite por pregunta y guardar la actividad.",
            side: "left",
            align: "start",
          },
          onHighlighted: () => {
            const trigger = document.querySelector('[title="Panel Lúdico"]') as HTMLButtonElement;
            if (trigger) trigger.click();
          }
        }
      ],
      onDestroyed: () => {
        localStorage.removeItem("ludiquiz_tour_active");
      }
    });

    driverInstance.current = driverObj;

    const timer = setTimeout(() => {
      // In case they click Next from answers to panel ludico, let's open the drawer programmatically
      const nextBtn = document.querySelector(".driver-popover-next-btn");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const activeStepIndex = driverObj.getActiveIndex();
          if (activeStepIndex === 3) {
            const trigger = document.querySelector('[title="Panel Lúdico"]') as HTMLButtonElement;
            if (trigger) trigger.click();
          }
        });
      }

      driverObj.drive();
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (driverInstance.current) {
        driverInstance.current.destroy();
      }
    };
  }, []);

  return null;
}