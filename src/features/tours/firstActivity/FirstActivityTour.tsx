"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { notify } from "@/components/ui";
import { ACTIVITY_SAVED_EVENT, type ActivitySavedDetail } from "@/components/editor/activitySavedEvent";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { FIRST_ACTIVITY_STEPS, shouldInviteFirstActivity, shouldOfferResume } from "@/lib/tours/tourProgress";
import { presentTourStep, type TourStepOptions } from "../tourStep";
import FirstActivityCard from "./FirstActivityCard";
import {
  FIRST_ACTIVITY_PARAM,
  MY_ACTIVITIES_PATH,
  SETTINGS_TOURS_PATH,
  getRuntime,
  getServerRuntime,
  setRuntime,
  stepAt,
  stepFromSearch,
  subscribeRuntime,
  type FirstActivityStepId,
} from "./firstActivitySteps";

const DASHBOARD_PATH = "/dashboard";

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

interface FirstActivityTourProps {
  /** Si el docente ya tiene actividades no se le invita (solo lo sabe el layout del panel). */
  hasActivities?: boolean;
}

/**
 * Visita "Crea tu primera actividad": del panel al editor de LudiQuiz en la misma pestaña.
 * Va en los layouts del panel y del editor; el estado de la pestaña está en firstActivitySteps.ts
 * y cada paso se muestra con presentTourStep, como las demás visitas.
 */
export default function FirstActivityTour({ hasActivities = false }: FirstActivityTourProps) {
  const t = useTranslations("FirstActivityTour");
  const router = useRouter();
  const pathname = usePathname();
  const { preferences, isLoaded, setFirstActivity } = useTourPreferences();
  const run = useSyncExternalStore(subscribeRuntime, getRuntime, getServerRuntime);
  const step = preferences.firstActivity.step;
  const currentRoute = stepAt(step).route;

  const finish = useCallback(() => {
    setFirstActivity({ status: "completada", step: FIRST_ACTIVITY_STEPS });
    setRuntime({ running: false, navigatingTo: null, done: true });
  }, [setFirstActivity]);

  const goTo = useCallback(
    (next: number) => {
      if (next > FIRST_ACTIVITY_STEPS) return finish();
      const target = stepAt(next);
      setFirstActivity({ status: "en_progreso", step: next });
      if (target.route !== window.location.pathname) {
        setRuntime({ navigatingTo: target.route });
        router.push(target.route);
      }
    },
    [finish, router, setFirstActivity],
  );

  const start = useCallback(
    (from: number) => {
      setRuntime({ running: true, done: false, resumeDismissed: false });
      goTo(from);
    },
    [goTo],
  );

  const showPausedNotice = useCallback(() => {
    notify.withAction(t("pausedToast"), { label: t("pausedToastLink"), onClick: () => router.push(SETTINGS_TOURS_PATH) }, 6000);
  }, [router, t]);

  /** Salir o Esc: la visita queda a medias en este paso y no se vuelve a ofrecer en esta sesión. */
  const exit = useCallback(() => {
    setRuntime({ running: false, navigatingTo: null, resumeDismissed: true });
    setFirstActivity({ status: "en_progreso", step });
    showPausedNotice();
  }, [setFirstActivity, showPausedNotice, step]);

  // ?primera-actividad=<paso> (Configuración > Visitas guiadas). Se espera a tener el
  // progreso del servidor: guardar antes pisaría el resto de las visitas.
  useEffect(() => {
    if (!isLoaded) return;
    const requested = stepFromSearch(window.location.search);
    if (requested === null) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(FIRST_ACTIVITY_PARAM);
    window.history.replaceState(window.history.state, "", url);
    start(requested);
  }, [isLoaded, pathname, start]);

  // Cambiar de pantalla por cuenta propia pausa la visita (queda en_progreso).
  useEffect(() => {
    if (!run.running) return;
    if (run.navigatingTo) {
      if (pathname === run.navigatingTo) setRuntime({ navigatingTo: null });
      return;
    }
    if (pathname !== currentRoute) setRuntime({ running: false });
  }, [pathname, run.running, run.navigatingTo, currentRoute]);

  // Guardar con éxito en el editor cierra la visita y se queda en el editor.
  useEffect(() => {
    if (!run.running || !pathname.startsWith("/create/")) return;
    const onSaved = (event: Event) => {
      event.preventDefault();
      setRuntime({ savedActivityId: (event as CustomEvent<ActivitySavedDetail>).detail.activityId });
      finish();
    };
    window.addEventListener(ACTIVITY_SAVED_EVENT, onSaved);
    return () => window.removeEventListener(ACTIVITY_SAVED_EVENT, onSaved);
  }, [run.running, pathname, finish]);

  const active = isLoaded && run.running && !run.done && !run.navigatingTo && pathname === currentRoute;
  const veil = preferences.tourMode !== "hints";

  useEffect(() => {
    if (!active) return;
    const definition = stepAt(step);
    return presentTourStep({
      selector: definition.selector,
      side: definition.side,
      title: t(`steps.${definition.id}.title`),
      description: t.markup(`steps.${definition.id}.description`, { b: (chunks) => `<strong>${chunks}</strong>` }),
      counter: t("counter", { current: step, total: FIRST_ACTIVITY_STEPS }),
      labels: { exit: t("exit"), previous: t("previous"), next: t("next") },
      hasPrevious: step > 1,
      scrollIntoView: definition.id === "badges",
      veil,
      onExit: exit,
      onPrevious: () => goTo(step - 1),
      onNext: () => goTo(step + 1),
      attach: stepAction(definition.id, () => {
        // El enlace del sidebar navega solo: se avisa a la visita para que no lo tome como salir.
        setFirstActivity({ status: "en_progreso", step: 2 });
        setRuntime({ navigatingTo: stepAt(2).route });
      }),
    });
  }, [active, step, veil, goTo, exit, setFirstActivity, t]);

  if (!isLoaded) return null;

  if (run.done) {
    const onEditor = pathname.startsWith("/create/");
    return (
      <FirstActivityCard
        autoFocus
        title={t("done.title")}
        text={t("done.text")}
        primary={{
          label: t("done.goToActivities"),
          onClick: () => {
            setRuntime({ done: false });
            if (pathname !== MY_ACTIVITIES_PATH) router.push(MY_ACTIVITIES_PATH);
          },
        }}
        secondary={{
          label: t("done.keepEditing"),
          onClick: () => {
            setRuntime({ done: false });
            if (!onEditor && run.savedActivityId !== null) router.push(`/create/ludiquiz?id=${run.savedActivityId}`);
          },
        }}
      />
    );
  }

  if (run.running || pathname !== DASHBOARD_PATH) return null;

  if (shouldInviteFirstActivity(preferences, hasActivities)) {
    return (
      <FirstActivityCard
        title={t("invite.title")}
        text={t("invite.text")}
        primary={{ label: t("invite.start"), onClick: () => start(1) }}
        secondary={{
          label: t("invite.later"),
          onClick: () => {
            setFirstActivity({ status: "pospuesta", step: 1 });
            showPausedNotice();
          },
        }}
      />
    );
  }

  if (shouldOfferResume(preferences) && !run.resumeDismissed) {
    return (
      <FirstActivityCard
        title={t("resume.title")}
        text={t("resume.step", { step, total: FIRST_ACTIVITY_STEPS })}
        primary={{ label: t("resume.continue"), onClick: () => start(step) }}
        secondary={{ label: t("resume.notNow"), onClick: () => setRuntime({ resumeDismissed: true }) }}
      />
    );
  }

  return null;
}

/** Atajo de cada paso: avanza cuando el docente hace lo que el paso le pide. */
function stepAction(id: FirstActivityStepId, onSidebarClick: () => void): TourStepOptions["attach"] {
  if (id === "sidebar") {
    return (element) => {
      const onClick = (event: MouseEvent) => {
        if (isPlainClick(event)) onSidebarClick();
      };
      element.addEventListener("click", onClick);
      return () => element.removeEventListener("click", onClick);
    };
  }
  if (id === "ludiquiz") {
    // La tarjeta abre el editor en otra pestaña; durante la visita, en la misma.
    return (element, advance) => {
      const onClick = (event: MouseEvent) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        advance();
      };
      element.addEventListener("click", onClick);
      return () => element.removeEventListener("click", onClick);
    };
  }
  if (id === "question") {
    // Avanza al salir del campo con texto, no por una pausa: pensar la pregunta lleva su tiempo.
    return (element, advance, { popoverPressed }) => {
      const onBlur = (event: FocusEvent) => {
        if (popoverPressed() || (event.relatedTarget as Element | null)?.closest(".driver-popover")) return;
        if (((element as HTMLInputElement | HTMLTextAreaElement).value ?? "").trim()) advance();
      };
      element.addEventListener("blur", onBlur);
      return () => element.removeEventListener("blur", onBlur);
    };
  }
  if (id === "answers") {
    // aria-pressed se actualiza al renderizar, después del clic.
    return (_element, advance) => {
      let timer: number | undefined;
      const onClick = (event: MouseEvent) => {
        if (!(event.target as Element | null)?.closest('[data-tour="correct-toggle"]')) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (document.querySelector('[data-tour="correct-toggle"][aria-pressed="true"]')) advance();
        }, 50);
      };
      document.addEventListener("click", onClick, true);
      return () => {
        window.clearTimeout(timer);
        document.removeEventListener("click", onClick, true);
      };
    };
  }
  return undefined;
}
