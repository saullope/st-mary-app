// Un mensaje que todavía no está traducido: la lógica compartida (validaciones,
// servicios) devuelve la clave y sus valores, y quien lo muestra lo traduce en el
// idioma del usuario (useMessage en el cliente, translateMessage en el servidor).

export type MessageValues = Record<string, string | number>;

export interface MessageDescriptor {
  /** Ruta completa en messages/*.json, p. ej. "Validation.lesson.empty". */
  key: string;
  values?: MessageValues;
}

export const message = (key: string, values?: MessageValues): MessageDescriptor => ({ key, values });
