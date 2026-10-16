// Muestra un paso de visita guiada con las reglas comunes a todas las visitas:
// no bloquea la página, espera a que no haya un modal abierto, salta el paso si su
// elemento no aparece y siempre ofrece Salir, Anterior y Siguiente (ver CLAUDE.md).
import { driver, type Driver, type PopoverDOM } from "driver.js";
import "driver.js/dist/driver.css";

/** Mientras está en el body, el velo de la visita deja pasar los clics (globals.css). */
export const NON_BLOCKING_CLASS = "ludi-tour-free";
const TARGET_CLASS = "ludi-guide-target";
const POLL_MS = 200;
/** Un paso cuyo elemento no aparece en este tiempo se salta. */
const MISSING_TIMEOUT_MS = 2000;

/** Modales, drawers y diálogos de la app: mientras haya uno visible la visita espera. */
const BLOCKING_LAYER = '[aria-modal="true"], .modal.show, .offcanvas.show';

// Solo cuenta una capa que de verdad se ve: hay paneles que quedan montados al cerrarse.
export const hasBlockingLayer = () =>
  Array.from(document.querySelectorAll<HTMLElement>(BLOCKING_LAYER)).some(
    (layer) =>
      !layer.closest('[aria-hidden="true"], [inert]') &&
      layer.getClientRects().length > 0 &&
      getComputedStyle(layer).visibility !== "hidden",
  );

export function findVisible(selector: string): HTMLElement | null {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element || element.getClientRects().length === 0) return null;
  return getComputedStyle(element).visibility === "hidden" ? null : element;
}

const isEditable = (element: Element | null) =>
  element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || (element as HTMLElement | null)?.isContentEditable === true;

export type TourSide = "top" | "bottom" | "left" | "right";

export interface TourStepContext {
  /** Verdadero si el último pointerdown fue sobre el tooltip (un blur que no es "terminé"). */
  popoverPressed: () => boolean;
}

export interface TourStepOptions {
  /** Siempre un atributo data-tour, nunca una clase CSS. */
  selector: string;
  side: TourSide;
  title: string;
  /** HTML de confianza: viene de messages. */
  description: string;
  counter: string;
  labels: { exit: string; previous: string; next: string };
  hasPrevious: boolean;
  /** Llevar el elemento al centro antes de mostrarlo (secciones dentro de paneles con scroll). */
  scrollIntoView?: boolean;
  /** Modo "solo sugerencias": sin velo. */
  veil?: boolean;
  onExit: () => void;
  onPrevious: () => void;
  /** También se llama cuando el elemento no aparece. */
  onNext: () => void;
  /** Atajo del paso: llamar a advance() cuando el docente hace la acción. */
  attach?: (element: HTMLElement, advance: () => void, context: TourStepContext) => (() => void) | void;
}

/** Empieza a mostrar el paso; devuelve la función que lo retira. */
export function presentTourStep(options: TourStepOptions): () => void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let instance: Driver | null = null;
  let shown: HTMLElement | null = null;
  let detachAction: (() => void) | null = null;
  let missingSince: number | null = null;
  let leaving = false;
  let pressingPopover = false;

  const hide = () => {
    detachAction?.();
    detachAction = null;
    shown?.classList.remove(TARGET_CLASS);
    shown = null;
    if (instance) {
      const current = instance;
      instance = null;
      current.destroy();
    }
    document.body.classList.remove(NON_BLOCKING_CLASS);
  };

  const leave = (action: () => void) => {
    if (leaving) return;
    leaving = true;
    action();
  };

  const exit = () => {
    const element = shown;
    leave(options.onExit);
    element?.focus({ preventScroll: true });
  };

  const renderControls = (popover: PopoverDOM) => {
    const { wrapper, title, description } = popover;
    title.id = "ludi-guide-title";
    description.id = "ludi-guide-description";
    wrapper.setAttribute("role", "dialog");
    wrapper.setAttribute("aria-labelledby", title.id);
    wrapper.setAttribute("aria-describedby", description.id);
    wrapper.tabIndex = -1;
    wrapper.addEventListener("pointerdown", () => {
      pressingPopover = true;
      // El blur de un campo llega entre pointerdown y pointerup; después ya no aplica.
      document.addEventListener("pointerup", () => window.setTimeout(() => (pressingPopover = false), 0), { once: true, capture: true });
    });

    const counter = document.createElement("p");
    counter.className = "ludi-guide-counter";
    counter.textContent = options.counter;
    wrapper.insertBefore(counter, title);

    const button = (label: string, kind: "primary" | "secondary", onClick: () => void) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = `ludi-guide-btn ludi-guide-btn-${kind}`;
      element.textContent = label;
      element.addEventListener("click", onClick);
      return element;
    };
    const actions = document.createElement("div");
    actions.className = "ludi-guide-actions";
    actions.append(button(options.labels.exit, "secondary", exit));
    const nav = document.createElement("div");
    nav.className = "ludi-guide-nav";
    if (options.hasPrevious) nav.append(button(options.labels.previous, "secondary", () => leave(options.onPrevious)));
    nav.append(button(options.labels.next, "primary", () => leave(options.onNext)));
    actions.append(nav);
    wrapper.append(actions);

    // No se quita el foco a quien está escribiendo.
    if (!isEditable(document.activeElement)) wrapper.focus({ preventScroll: true });
  };

  const show = (element: HTMLElement) => {
    if (options.scrollIntoView) element.scrollIntoView({ block: "center", behavior: "auto" });
    document.body.classList.add(NON_BLOCKING_CLASS);
    instance = driver({
      animate: !reduceMotion,
      smoothScroll: !reduceMotion,
      allowClose: false,
      allowKeyboardControl: false,
      overlayColor: "rgb(20, 10, 46)",
      overlayOpacity: options.veil === false ? 0 : 0.2,
      overlayClickBehavior: () => undefined,
      stagePadding: 6,
      stageRadius: 12,
      showButtons: [],
      popoverClass: "ludi-guide-popover",
      onPopoverRender: renderControls,
    });
    instance.highlight({
      element,
      popover: { title: options.title, description: options.description, side: options.side, align: "center" },
    });
    // driver.js desactiva los clics de toda la página con esta clase; la visita no bloquea.
    document.body.classList.remove("driver-active");
    element.classList.add(TARGET_CLASS);
    shown = element;
    detachAction =
      options.attach?.(element, () => leave(options.onNext), {
        popoverPressed: () => {
          const pressed = pressingPopover;
          pressingPopover = false;
          return pressed;
        },
      }) ?? null;
  };

  const tick = () => {
    if (leaving) return;
    if (instance) {
      // Una capa nueva o un elemento que desaparece ocultan el paso hasta que vuelva a verse.
      if (hasBlockingLayer() || !shown?.isConnected || !findVisible(options.selector)) hide();
      else instance.refresh();
      return;
    }
    if (hasBlockingLayer()) {
      missingSince = null;
      return;
    }
    const element = findVisible(options.selector);
    if (element) {
      missingSince = null;
      show(element);
      return;
    }
    missingSince ??= Date.now();
    if (Date.now() - missingSince >= MISSING_TIMEOUT_MS) leave(options.onNext);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && instance && !hasBlockingLayer()) exit();
  };

  document.addEventListener("keydown", onKey);
  tick();
  const timer = window.setInterval(tick, POLL_MS);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("keydown", onKey);
    hide();
  };
}
