/**
 * Ruta a la que volver después del login. Solo se aceptan rutas internas, para
 * que un enlace con ?redirect= no pueda mandar al usuario a otro sitio.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/welcome-educator"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
