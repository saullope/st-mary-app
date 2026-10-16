"use client";

import { useEffect } from "react";

/**
 * Mientras `active`, avisa antes de dejar la pantalla: al cerrar o recargar la pestaña con
 * el aviso del navegador, y al seguir un enlace interno llamando a `onLeaveAttempt(href)`,
 * que decide si navega. Los enlaces a otra pestaña o con tecla modificadora no se tocan.
 */
export function useLeaveWarning(active: boolean, onLeaveAttempt: (href: string) => void) {
  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Algunos navegadores todavía piden returnValue para mostrar el aviso.
      event.returnValue = "";
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      // Antes que el onClick de next/link, que navegaría sin preguntar.
      event.preventDefault();
      event.stopPropagation();
      onLeaveAttempt(url.pathname + url.search + url.hash);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active, onLeaveAttempt]);
}
