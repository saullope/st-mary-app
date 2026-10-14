"use client";

import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaClock, FaCheck, FaTimes, FaHourglassHalf } from "react-icons/fa";
import { isPendingReview } from "@/features/form/formQuestions";
import WrittenAnswerReview from "./WrittenAnswerReview";
import { useTranslations } from "next-intl";

interface StudentSessionLogProps {
  respuestas: any[];
}

type ReviewOverride = { esCorrecta: boolean; reviewed: true };
type Translate = (key: string, values?: Record<string, string | number>) => string;

const optionLabel = (option: any, pregunta: any, t: Translate) => {
  // Verdadero/Falso se guardan en español: se muestran por posición en el idioma activo.
  if (pregunta?.tipoActividadId === 2) return option.indice === 1 ? t("true") : t("false");
  return option.texto || t("option", { number: option.indice });
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
function studentAnswerText(r: any, t: Translate): string {
  const pregunta = r.pregunta;
  if (pregunta?.tipoPregunta === "multiple") {
    const ids = parseOptionIds(r.opcionesJson);
    const chosen = (pregunta.opciones || []).filter((o: any) => ids.includes(String(o.id)));
    return chosen.length ? chosen.map((o: any) => optionLabel(o, pregunta, t)).join(", ") : t("noAnswer");
  }
  if (pregunta?.tipoActividadId === 2 && r.respuestaBooleana !== null && r.respuestaBooleana !== undefined) {
    return r.respuestaBooleana ? t("true") : t("false");
  }
  if (!r.opcion) return pregunta?.tipoPregunta ? t("noAnswer") : t("timeout");
  return optionLabel(r.opcion, pregunta, t);
}

function correctAnswerText(pregunta: any, t: Translate): string {
  const options = correctOptions(pregunta);
  return options.length ? options.map((o: any) => optionLabel(o, pregunta, t)).join(", ") : t("unknown");
}

export default function StudentSessionLog({ respuestas }: StudentSessionLogProps) {
  // Calificaciones hechas en esta vista, antes de que el reporte se vuelva a cargar.
  const [overrides, setOverrides] = useState<Record<number, ReviewOverride>>({});
  const t = useTranslations("SessionLog");

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
          badgeText = t("pending");
          badgeClass = "bg-warning text-dark";
        } else if (!r.esCorrecta) {
          badgeText = t("review");
          badgeClass = "bg-danger text-white";
        } else if (!isTimed || timeSeconds > 5) {
          badgeText = isTimed ? t("thoughtful") : t("correct");
          badgeClass = isTimed ? "bg-warning text-dark" : "bg-success text-white";
        } else {
          badgeText = t("mastered");
          badgeClass = "bg-success text-white";
        }

        const accent = pending ? "#f59e0b" : r.esCorrecta ? "#198754" : "#dc3545";
        const StatusIcon = pending ? FaHourglassHalf : r.esCorrecta ? FaCheckCircle : FaTimesCircle;
        const statusClass = pending ? "text-warning" : r.esCorrecta ? "text-success" : "text-danger";

        return (
          <div key={r.id ?? idx} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderLeft: `5px solid ${accent}` }}>
            <div className="card-header bg-white border-0 py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-muted small">{t("question", { number: idx + 1 })}</span>
              <div className="d-flex align-items-center gap-2">
                {isTimed && (
                  <span className="text-muted small d-flex align-items-center">
                    <FaClock className="me-1" aria-hidden="true" /> {timeSeconds.toFixed(1)}s
                  </span>
                )}
                <span className={`badge rounded-pill ${badgeClass}`}>{badgeText}</span>
              </div>
            </div>

            <div className="card-body p-3 pt-1">
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "var(--text-base)" }}>
                <StatusIcon className={`${statusClass} me-2 fs-5 align-text-bottom`} aria-hidden="true" />
                {r.pregunta?.enunciado || t("noQuestionText")}
              </h6>

              {isWritten ? (
                <div className="d-flex flex-column gap-2">
                  <div className="p-2 rounded border bg-light">
                    <small className="text-muted d-block" style={{ fontSize: "var(--text-meta)" }}>{t("theirAnswer")}</small>
                    <p className="text-dark small mb-0" style={{ whiteSpace: "pre-wrap" }}>{r.respuestaTexto || t("noAnswer")}</p>
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
                      <small className="text-muted d-block" style={{ fontSize: "var(--text-meta)" }}>{t("theirAnswer")}</small>
                      <span className="text-dark fw-bold small">{studentAnswerText(r, t)}</span>
                    </div>
                  </div>

                  {!r.esCorrecta && (
                    <div className="d-flex align-items-start p-2 rounded bg-light border border-secondary border-opacity-25">
                      <FaCheck className="text-success mt-1 me-2 flex-shrink-0" />
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: "var(--text-meta)" }}>{t("correctAnswer")}</small>
                        <span className="text-dark fw-bold small">{correctAnswerText(r.pregunta, t)}</span>
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
