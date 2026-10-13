"use client";

import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaCheck, FaTimes, FaHourglassHalf } from "react-icons/fa";
import { isPendingReview } from "@/features/form/formQuestions";
import WrittenAnswerReview from "./WrittenAnswerReview";

interface StudentSessionLogProps {
  respuestas: any[];
}

type ReviewOverride = { esCorrecta: boolean; reviewed: true };

const optionLabel = (option: any, pregunta: any) => {
  if (pregunta?.tipoActividadId === 2) return option.indice === 1 ? "Verdadero" : "Falso";
  return option.texto || `Opción ${option.indice}`;
};

const correctOptions = (pregunta: any) =>
  (pregunta?.opciones || []).filter((o: any) => o.esCorrecta || o.es_correcta);

function parseOptionIds(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

/** Lo que respondió el estudiante, según el tipo de pregunta. */
function studentAnswerText(r: any): string {
  const pregunta = r.pregunta;
  if (pregunta?.tipoPregunta === "multiple") {
    const ids = parseOptionIds(r.opcionesJson);
    const chosen = (pregunta.opciones || []).filter((o: any) => ids.includes(String(o.id)));
    return chosen.length ? chosen.map((o: any) => optionLabel(o, pregunta)).join(", ") : "Sin respuesta";
  }
  if (pregunta?.tipoActividadId === 2 && r.respuestaBooleana !== null && r.respuestaBooleana !== undefined) {
    return r.respuestaBooleana ? "Verdadero" : "Falso";
  }
  if (!r.opcion) return pregunta?.tipoPregunta ? "Sin respuesta" : "Sin respuesta (Tiempo agotado)";
  return optionLabel(r.opcion, pregunta);
}

function correctAnswerText(pregunta: any): string {
  const options = correctOptions(pregunta);
  return options.length ? options.map((o: any) => optionLabel(o, pregunta)).join(", ") : "Desconocido";
}

export default function StudentSessionLog({ respuestas }: StudentSessionLogProps) {
  // Calificaciones hechas en esta vista, antes de que el reporte se vuelva a cargar.
  const [overrides, setOverrides] = useState<Record<number, ReviewOverride>>({});

  return (
    <div className="d-flex flex-column gap-3">
      {respuestas.map((original, idx) => {
        const override = overrides[original.id];
        const r = override ? { ...original, esCorrecta: override.esCorrecta, estadoRevision: "REVISADA" } : original;
        const isWritten = r.pregunta?.tipoPregunta === "long";
        const pending = isPendingReview(r);
        // Los formularios no tienen tiempo de respuesta.
        const isTimed = !r.pregunta?.tipoPregunta;
        const timeSeconds = r.tiempoRespuestaMs / 1000;

        let badgeText: string;
        let badgeClass: string;
        if (pending) {
          badgeText = "Por revisar";
          badgeClass = "bg-warning text-dark";
        } else if (!r.esCorrecta) {
          badgeText = "Revisar";
          badgeClass = "bg-danger text-white";
        } else if (!isTimed || timeSeconds > 5) {
          badgeText = isTimed ? "Reflexionado" : "Correcta";
          badgeClass = isTimed ? "bg-warning text-dark" : "bg-success text-white";
        } else {
          badgeText = "¡Dominado!";
          badgeClass = "bg-success text-white";
        }

        const accent = pending ? "#f59e0b" : r.esCorrecta ? "#198754" : "#dc3545";
        const StatusIcon = pending ? FaHourglassHalf : r.esCorrecta ? FaCheckCircle : FaTimesCircle;
        const statusClass = pending ? "text-warning" : r.esCorrecta ? "text-success" : "text-danger";

        return (
          <div key={r.id ?? idx} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderLeft: `5px solid ${accent}` }}>
            <div className="card-header bg-white border-0 py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-muted small">Pregunta {idx + 1}</span>
              <div className="d-flex align-items-center gap-2">
                {isTimed && (
                  <span className="text-muted small d-flex align-items-center">
                    <FaClock className="me-1" /> {timeSeconds.toFixed(1)}s
                  </span>
                )}
                <span className={`badge rounded-pill ${badgeClass}`}>{badgeText}</span>
              </div>
            </div>

            <div className="card-body p-3 pt-1">
              <h6 className="fw-bold text-dark mb-3">
                <StatusIcon className={`${statusClass} me-2 fs-5 align-text-bottom`} />
                {r.pregunta?.enunciado || "Pregunta sin texto"}
              </h6>

              {isWritten ? (
                <div className="d-flex flex-column gap-2">
                  <div className="p-2 rounded border bg-light">
                    <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>Su respuesta</small>
                    <p className="text-dark small mb-0" style={{ whiteSpace: "pre-wrap" }}>{r.respuestaTexto || "Sin respuesta"}</p>
                  </div>
                  <WrittenAnswerReview
                    respuestaId={r.id}
                    approved={pending ? null : Boolean(r.esCorrecta)}
                    onReviewed={(approved) => setOverrides((prev) => ({ ...prev, [r.id]: { esCorrecta: approved, reviewed: true } }))}
                  />
                </div>
              ) : (
                <div className="d-flex flex-column gap-2 mt-2">
                  <div className={`d-flex align-items-start p-2 rounded border ${r.esCorrecta ? "bg-success bg-opacity-10 border-success" : "bg-danger bg-opacity-10 border-danger"} border-opacity-50`}>
                    {r.esCorrecta ? <FaCheck className="text-success mt-1 me-2 flex-shrink-0" /> : <FaTimes className="text-danger mt-1 me-2 flex-shrink-0" />}
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>Su respuesta</small>
                      <span className="text-dark fw-bold small">{studentAnswerText(r)}</span>
                    </div>
                  </div>

                  {!r.esCorrecta && (
                    <div className="d-flex align-items-start p-2 rounded bg-light border border-secondary border-opacity-25">
                      <FaCheck className="text-success mt-1 me-2 flex-shrink-0" />
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>Respuesta correcta</small>
                        <span className="text-dark fw-bold small">{correctAnswerText(r.pregunta)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
