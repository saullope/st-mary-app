/** Navegación completa: descarta el estado en memoria (Redux, contexto) al cerrar la sesión. */
export function hardNavigate(url: string) {
  window.location.assign(url);
}
