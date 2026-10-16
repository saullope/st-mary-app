// Tipos de notificación del panel docente. Módulo sin dependencias: lo usan las rutas,
// los servicios que crean avisos y la campana. Textos: messages Notifications.types.<tipo>.

export const NOTIFICATION_TYPES = ["review_pending", "evaluation_pending", "session_summary"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const isNotificationType = (value: unknown): value is NotificationType =>
  NOTIFICATION_TYPES.includes(value as NotificationType);

/** Datos con los que el cliente arma el texto traducido (parámetros del mensaje). */
export type NotificationData = Record<string, string | number>;

export interface NotificationItem {
  id: string;
  type: NotificationType;
  data: NotificationData;
  link: string | null;
  read: boolean;
  updatedAt: string;
}

export interface NotificationList {
  items: NotificationItem[];
  unread: number;
}

// Una notificación por hecho: la clave identifica la sesión a la que se refiere.
export const reviewKey = (sessionId: bigint | string) => `review:${sessionId}`;
export const evaluationKey = (sessionId: bigint | string) => `evaluation:${sessionId}`;
export const summaryKey = (sessionId: bigint | string) => `summary:${sessionId}`;

export const reportLink = (sessionId: bigint | string) => `/dashboard/reports/${sessionId}`;

/** Lee la columna muted_notifications; un valor dañado cuenta como nada apagado. */
export function parseMuted(raw: string | null | undefined): NotificationType[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter(isNotificationType))] : [];
  } catch {
    return [];
  }
}

export function parseData(raw: string): NotificationData {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === "string" || typeof value === "number"),
    ) as NotificationData;
  } catch {
    return {};
  }
}
