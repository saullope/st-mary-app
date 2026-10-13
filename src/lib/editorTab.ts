const EDITOR_SLUG_BY_TYPE: Record<number, string> = {
  1: "ludiquiz",
  2: "trueorfalse",
  3: "ludimemory",
  4: "ludileccion",
  5: "ludiform",
};

export function getEditorRoute(tipoActividadId: number, activityId: number | string): string {
  const slug = EDITOR_SLUG_BY_TYPE[tipoActividadId] ?? "ludimemory";
  return `/create/${slug}?id=${activityId}`;
}

/**
 * Abre la pestaña de forma síncrona dentro del click: tras un await el navegador
 * ya no lo considera gesto del usuario y bloquea window.open como popup.
 */
export function openPendingEditorTab() {
  const tab = window.open("", "_blank");
  // Equivale a noopener sin perder la referencia que necesitamos para navegar después.
  if (tab) tab.opener = null;

  return {
    navigate(route: string) {
      if (tab && !tab.closed) {
        tab.location.href = route;
        return;
      }
      window.location.href = route;
    },
    cancel() {
      tab?.close();
    },
  };
}
