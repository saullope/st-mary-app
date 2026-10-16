"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { presentTourStep, type TourSide } from "./tourStep";

/** ?tour=<id> abre la visita (Configuración > Visitas guiadas). */
export const TOUR_QUERY_PARAM = "tour";

export interface GuidedStep {
  /** Selector de un atributo data-tour. */
  element: string;
  title: string;
  description: string;
  side?: TourSide;
  /** Llevar el elemento al centro antes de mostrarlo (secciones dentro de paneles con scroll). */
  scrollIntoView?: boolean;
}

interface GuidedTourOptions {
  id: string;
  steps: GuidedStep[];
  /** Texto del botón del último paso. */
  doneText?: string;
  /** Falso mientras la pantalla no está lista para mostrar la visita. */
  ready?: boolean;
}

function takeForcedStart(id: string): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get(TOUR_QUERY_PARAM) !== id) return false;
  url.searchParams.delete(TOUR_QUERY_PARAM);
  window.history.replaceState(window.history.state, "", url);
  return true;
}

/**
 * Visita guiada de una pantalla. Solo se abre a pedido (?tour=<id>); la única que se
 * ofrece sola es "Crea tu primera actividad". Cada paso sigue las reglas de presentTourStep.
 * Salir la deja pospuesta y terminarla la marca como completada (se ve en Configuración).
 */
export function useGuidedTour({ id, steps, doneText, ready = true }: GuidedTourOptions) {
  const t = useTranslations("Tours.common");
  const { preferences, isLoaded, markTourAsCompleted, postponeTours } = useTourPreferences();
  const [index, setIndex] = useState<number | null>(null);

  // Los pasos y callbacks cambian en cada render; el paso visible solo cambia con index.
  const latest = useRef({ steps, doneText, markTourAsCompleted, postponeTours });
  latest.current = { steps, doneText, markTourAsCompleted, postponeTours };
  // ?tour= se lee una sola vez: en desarrollo Strict Mode corre el efecto dos veces.
  const forced = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded || !ready) return;
    if (forced.current === null) forced.current = takeForcedStart(id);
    if (forced.current) setIndex(0);
  }, [id, isLoaded, ready]);

  const veil = preferences.tourMode !== "hints";

  useEffect(() => {
    if (index === null) return;
    const { steps: tourSteps, doneText: lastText } = latest.current;
    const step = tourSteps[index];
    if (!step) return;
    const isLast = index === tourSteps.length - 1;
    return presentTourStep({
      selector: step.element,
      side: step.side ?? "bottom",
      title: step.title,
      description: step.description,
      counter: t("progress", { current: index + 1, total: tourSteps.length }),
      labels: { exit: t("exit"), previous: t("previous"), next: isLast ? lastText ?? t("done") : t("next") },
      hasPrevious: index > 0,
      scrollIntoView: step.scrollIntoView,
      veil,
      onExit: () => {
        forced.current = false;
        latest.current.postponeTours([id]);
        setIndex(null);
      },
      onPrevious: () => setIndex(index - 1),
      onNext: () => {
        if (!isLast) return setIndex(index + 1);
        forced.current = false;
        latest.current.markTourAsCompleted(id);
        setIndex(null);
      },
    });
  }, [id, index, veil, t]);
}
