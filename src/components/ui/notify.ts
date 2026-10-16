import { toast } from "sonner";

/**
 * Retroalimentación global de la app (éxito/error/advertencia/información),
 * reemplazo de alert() y de instancias sueltas de <Toaster/>. Requiere el
 * <Toaster /> montado una sola vez en el layout raíz (src/app/layout.tsx)
 * - por eso puede llamarse desde cualquier componente cliente sin volver a
 * montar nada.
 *
 * Basado en sonner, que ya renderiza cada aviso con role="status" y
 * aria-live, así que queda anunciado por lectores de pantalla sin trabajo
 * adicional (a diferencia de alert(), que bloquea el hilo y no es
 * consistente entre navegadores).
 */
export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  warning: (message: string, description?: string) => toast.warning(message, { description }),
  info: (message: string, description?: string) => toast.info(message, { description }),
  /** Aviso con un enlace de acción (p. ej. "Ir a Visitas guiadas"). */
  withAction: (message: string, action: { label: string; onClick: () => void }, duration?: number) =>
    toast.info(message, { action, duration }),
};
