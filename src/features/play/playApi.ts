import { PARTICIPANT_TOKEN_HEADER } from "@/lib/play/constants";

export interface PlayParticipant {
  id: string;
  name: string;
  /** Código secreto recibido al unirse; ausente en participantes previos a este control. */
  token?: string;
}

/**
 * Llamada a /api/play/* en nombre del participante: agrega su id al cuerpo y su
 * código secreto en la cabecera que verifica el servidor.
 */
export function postPlay(path: string, participant: PlayParticipant, body: Record<string, unknown> = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (participant.token) headers[PARTICIPANT_TOKEN_HEADER] = participant.token;
  return fetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify({ ...body, participanteId: participant.id }),
  });
}
