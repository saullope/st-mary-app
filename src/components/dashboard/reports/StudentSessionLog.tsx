"use client";

import { FaCheckCircle, FaTimesCircle, FaClock, FaCheck, FaTimes } from "react-icons/fa";

interface StudentSessionLogProps {
  respuestas: any[];
}

export default function StudentSessionLog({ respuestas }: StudentSessionLogProps) {
  const getOptionText = (r: any, pregunta: any, isCorrectAns: boolean = false) => {
    // Si la actividad es tipo Verdadero/Falso (tipoActividadId === 2)
    if (pregunta?.tipoActividadId === 2) {
      if (isCorrectAns) {
        // Encontrar la opción correcta para determinar qué decir
        const correctOp = pregunta.opciones?.find((o: any) => o.esCorrecta || o.es_correcta);
        if (correctOp) {
           return correctOp.indice === 1 ? "Verdadero" : "Falso";
        }
      } else {
        // Lógica de lo que respondió el estudiante
        if (r.respuestaBooleana !== null && r.respuestaBooleana !== undefined) {
           return r.respuestaBooleana ? "Verdadero" : "Falso";
        }
        if (r.opcion) {
           return r.opcion.indice === 1 ? "Verdadero" : "Falso";
        }
      }
      return "Sin respuesta";
    }

    // Para preguntas normales
    if (isCorrectAns) {
        const correctOp = pregunta?.opciones?.find((o: any) => o.esCorrecta || o.es_correcta);
        if (correctOp && correctOp.texto) return correctOp.texto;
        if (correctOp) return `Opción ${correctOp.indice}`;
    } else {
        if (!r.opcion) return "Sin respuesta (Tiempo agotado)";
        if (r.opcion.texto) return r.opcion.texto;
        return `Opción ${r.opcion.indice}`;
    }
    
    return "Desconocido";
  };

  return (
    <div className="d-flex flex-column gap-3">
      {respuestas.map((r, idx) => {
        const timeSeconds = r.tiempoRespuestaMs / 1000;
        const correctOptionObj = r.pregunta?.opciones?.find((o: any) => o.esCorrecta || o.es_correcta);
        
        // Visual Flags Logic
        let badgeText = "";
        let badgeClass = "";
        
        if (!r.esCorrecta) {
          badgeText = "Revisar";
          badgeClass = "bg-danger text-white";
        } else if (timeSeconds <= 5) {
          badgeText = "¡Dominado!";
          badgeClass = "bg-success text-white";
        } else {
          badgeText = "Reflexionado";
          badgeClass = "bg-warning text-dark";
        }

        return (
          <div key={idx} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderLeft: `5px solid ${r.esCorrecta ? '#198754' : '#dc3545'}` }}>
            <div className="card-header bg-white border-0 py-2 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-muted small">Pregunta {idx + 1}</span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small d-flex align-items-center">
                  <FaClock className="me-1" /> {timeSeconds.toFixed(1)}s
                </span>
                <span className={`badge rounded-pill ${badgeClass}`}>{badgeText}</span>
              </div>
            </div>
            
            <div className="card-body p-3 pt-1">
              <h6 className="fw-bold text-dark mb-3">
                {r.esCorrecta ? (
                  <FaCheckCircle className="text-success me-2 fs-5 align-text-bottom" />
                ) : (
                  <FaTimesCircle className="text-danger me-2 fs-5 align-text-bottom" />
                )}
                {r.pregunta?.enunciado || "Pregunta sin texto"}
              </h6>

              <div className="d-flex flex-column gap-2 mt-2">
                {/* Student's Choice */}
                <div className={`d-flex align-items-start p-2 rounded border ${r.esCorrecta ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'} border-opacity-50`}>
                  {r.esCorrecta ? (
                    <FaCheck className="text-success mt-1 me-2 flex-shrink-0" />
                  ) : (
                    <FaTimes className="text-danger mt-1 me-2 flex-shrink-0" />
                  )}
                  <div>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Su respuesta</small>
                    <span className="text-dark fw-bold small">{getOptionText(r, r.pregunta, false)}</span>
                  </div>
                </div>
                
                {/* Correct Choice (Only show if student was wrong) */}
                {!r.esCorrecta && (
                  <div className="d-flex align-items-start p-2 rounded bg-light border border-secondary border-opacity-25">
                    <FaCheck className="text-success mt-1 me-2 flex-shrink-0" />
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Respuesta correcta</small>
                      <span className="text-dark fw-bold small">{getOptionText(r, r.pregunta, true)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}