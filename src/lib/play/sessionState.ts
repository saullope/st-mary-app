// Estados de una sesión de juego (LUDI_SESION.estado). En la base de datos conviven
// valores nuevos ("lobby", "activa", "finalizada") con otros heredados ("ESPERANDO",
// "EN_CURSO", "FINALIZADA"), así que toda lectura pasa por sessionPhase.

export type SessionPhase = "waiting" | "active" | "finished";

/** Valores que se escriben al cambiar de estado. */
export const SESSION_STATE: Record<SessionPhase, string> = {
  waiting: "lobby",
  active: "activa",
  finished: "finalizada",
};

export function sessionPhase(estado: string | null | undefined): SessionPhase {
  const value = (estado ?? "").toLowerCase();
  if (value === "activa" || value === "en_curso") return "active";
  if (value.startsWith("finaliz")) return "finished";
  return "waiting";
}
