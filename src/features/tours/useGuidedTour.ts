"use client";

import { useEffect, useRef } from "react";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslations } from "next-intl";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { shouldAutoStart } from "@/lib/tours/tourProgress";

/** Mientras está en el body, el velo de la visita deja pasar los clics (ver globals.css). */
const NON_BLOCKING_CLASS = "ludi-tour-free";
/** ?tour=<id> abre la visita aunque ya esté terminada (Configuración > Visitas guiadas). */
export const TOUR_QUERY_PARAM = "tour";

interface GuidedTourOptions {
  id: string;
  steps: DriveStep[];
  /** Visitas que "Ver más tarde" deja pendientes; por defecto solo esta. */
  journey?: readonly string[];
  /** Texto del botón del último paso. */
  doneText?: string;
  /** Al terminar la visita (no al cerrarla ni posponerla), p. ej. ir a la siguiente pantalla. */
  onComplete?: () => void;
  /** Falso mientras la pantalla no está lista para mostrar la visita. */
  ready?: boolean;
  delayMs?: number;
}

type Ending = "done" | "later" | "closed" | "unmounted";

function takeForcedStart(id: string): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get(TOUR_QUERY_PARAM) !== id) return false;
  url.searchParams.delete(TOUR_QUERY_PARAM);
  window.history.replaceState(window.history.state, "", url);
  return true;
}

/**
 * Visita guiada no invasiva: no bloquea la página, se puede cerrar con Escape o con
 * la X (queda pendiente solo esta visita) y "Ver más tarde" pospone todo el recorrido.
 * Ninguna de las dos vuelve a abrirse sola; se retoman desde Configuración.
 */
export function useGuidedTour({ id, steps, journey, doneText, onComplete, ready = true, delayMs = 900 }: GuidedTourOptions) {
  const t = useTranslations("Tours.common");
  const { preferences, isLoaded, markTourAsCompleted, postponeTours } = useTourPreferences();

  // Los pasos y callbacks cambian en cada render; la visita debe arrancar una sola vez.
  const latest = useRef({ preferences, steps, journey, doneText, onComplete, markTourAsCompleted, postponeTours });
  latest.current = { preferences, steps, journey, doneText, onComplete, markTourAsCompleted, postponeTours };
  const started = useRef(false);
  // ?tour= se lee una sola vez: en desarrollo Strict Mode corre el efecto dos veces.
  const forced = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded || !ready || started.current) return;
    if (forced.current === null) forced.current = takeForcedStart(id);
    const { preferences: prefs, steps: tourSteps } = latest.current;
    if (!forced.current && !shouldAutoStart(prefs, id)) return;
    started.current = true;

    const hints = prefs.tourMode === "hints";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ending: Ending = "closed";
    let instance: Driver | null = null;

    instance = driver({
      steps: tourSteps,
      showProgress: true,
      progressText: t("progress", { current: "{{current}}", total: "{{total}}" }),
      allowClose: true,
      allowKeyboardControl: true,
      // Sin oscurecer en modo pistas; en modo completo, apenas para ubicar el elemento.
      overlayColor: "rgb(20, 10, 46)",
      overlayOpacity: hints ? 0 : 0.35,
      overlayClickBehavior: () => undefined,
      stagePadding: 6,
      stageRadius: 12,
      smoothScroll: !reduceMotion,
      animate: !reduceMotion,
      popoverClass: `ludi-tour ${hints ? "driverjs-hints-only" : "driverjs-dashboard-theme"}`,
      nextBtnText: t("next"),
      prevBtnText: t("previous"),
      doneBtnText: latest.current.doneText ?? t("done"),
      onPopoverRender: (popover) => {
        popover.closeButton.setAttribute("aria-label", t("close"));
        const later = document.createElement("button");
        later.type = "button";
        later.className = "ludi-tour-later";
        later.textContent = t("later");
        later.addEventListener("click", () => {
          ending = "later";
          instance?.destroy();
        });
        popover.footer.insertBefore(later, popover.footer.firstChild);
      },
      onNextClick: (_element, _step, { driver: active }) => {
        if (active.isLastStep()) {
          ending = "done";
          active.destroy();
          return;
        }
        active.moveNext();
      },
      onDestroyed: () => {
        document.body.classList.remove(NON_BLOCKING_CLASS);
        const current = latest.current;
        if (ending === "done") {
          current.markTourAsCompleted(id);
          current.onComplete?.();
        } else if (ending === "later") {
          current.postponeTours(current.journey ?? [id]);
        } else if (ending === "closed") {
          current.postponeTours([id]);
        }
      },
    });

    const timer = window.setTimeout(() => {
      document.body.classList.add(NON_BLOCKING_CLASS);
      instance?.drive();
      // driver.js pone "driver-active" en el body (una sola vez) para desactivar los clics
      // en toda la página; sin esa clase la página sigue usable durante la visita.
      document.body.classList.remove("driver-active");
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      // Salir de la página no cuenta como posponer.
      ending = "unmounted";
      if (instance?.isActive()) instance.destroy();
      document.body.classList.remove(NON_BLOCKING_CLASS);
      started.current = false;
    };
  }, [id, isLoaded, ready, delayMs, t]);
}
