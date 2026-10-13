import type { NextRequest } from "next/server";

/**
 * Las Server Actions rechazan peticiones de otro sitio; las rutas /api que
 * escriben con la cookie de sesión deben hacer lo mismo. Un navegador siempre
 * envía Origin en un POST/PUT entre sitios, así que solo se rechaza si viene y
 * no coincide (clientes como Postman no lo envían y usan su propia sesión).
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  // Detrás de un proxy el host público llega en x-forwarded-host.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
