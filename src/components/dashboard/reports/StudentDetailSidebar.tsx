"use client";

import { FaTimes, FaChartLine, FaCalendarAlt, FaBullseye, FaBolt, FaListUl } from "react-icons/fa";
import StudentSessionLog from "./StudentSessionLog";

interface SidebarProps {
  student: any | null;
  onClose: () => void;
  avgClassScore: number;
  avgClassTotalTimeMs: number;
}

export default function StudentDetailSidebar({ student, onClose, avgClassScore, avgClassTotalTimeMs }: SidebarProps) {
  if (!student) return null;

  // Calculate Effectiveness
  let pCorrect = 0;
  let pTotal = 0;

  student.respuestas.forEach((r: any) => {
    pTotal++;
    if (r.esCorrecta) {
      pCorrect++;
    }
  });

  const effectiveness = pTotal > 0 ? Math.round((pCorrect / pTotal) * 100) : 0;
  const isAboveAverage = student.puntaje_total >= avgClassScore;

  // Effort Metric
  const studentTotalTimeMs = student.respuestas.reduce((acc: number, r: any) => acc + (r.tiempoRespuestaMs || 0), 0);
  
  let effortLabel = "Promedio";
  if (avgClassTotalTimeMs > 0) {
    if (studentTotalTimeMs < avgClassTotalTimeMs * 0.7) {
      effortLabel = "Rápido";
    } else if (studentTotalTimeMs > avgClassTotalTimeMs * 1.3) {
      effortLabel = "Analítico";
    }
  }

  return (
    <div className="student-sidebar-overlay" onClick={onClose}>
      <div className="student-sidebar-content d-flex flex-column" onClick={e => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="p-3 border-bottom d-flex flex-column bg-white shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1050 }}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex align-items-center gap-3">
              {student.avatar ? (
                <img src={student.avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-sm" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
              ) : (
                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', fontSize: '24px' }}>
                  {student.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h5 className="fw-bold text-dark mb-0">{student.nombre}</h5>
                <div className="text-muted small">
                  Score: <strong className={isAboveAverage ? 'text-success' : 'text-danger'}>{student.puntaje_total} pts</strong>
                </div>
              </div>
            </div>
            <button className="btn btn-close shadow-none" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2 px-2 py-1 bg-light rounded-3 border">
            <span className="small fw-bold text-muted">Tiempo Total:</span>
            <span className="small fw-bold text-dark">{(studentTotalTimeMs / 1000).toFixed(1)} s</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-grow-1 overflow-auto bg-light">
          {/* Stats Section */}
          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3 text-uppercase small"><FaChartLine className="me-2"/> Rendimiento General</h6>
            
            <div className="card bg-white border-0 shadow-sm rounded-4 p-3 mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="small fw-bold">Efectividad Global</span>
                <span className="small text-primary fw-bold">{effectiveness}%</span>
              </div>
              <div className="progress" style={{ height: '8px' }}>
                <div className="progress-bar bg-primary" style={{ width: `${effectiveness}%` }}></div>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <div className="card bg-white border-0 shadow-sm rounded-4 p-3 h-100 text-center">
                  <small className="text-muted d-block mb-1">Promedio Clase</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <strong className="text-dark fs-6">{Math.round(avgClassScore)} pts</strong>
                    <FaBullseye className={isAboveAverage ? 'text-success' : 'text-danger'} />
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card bg-white border-0 shadow-sm rounded-4 p-3 h-100 text-center">
                  <small className="text-muted d-block mb-1">Ritmo de Trabajo</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <strong className="text-dark fs-6">{effortLabel}</strong>
                    <FaBolt className={effortLabel === 'Rápido' ? 'text-warning' : effortLabel === 'Analítico' ? 'text-info' : 'text-secondary'} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Chronological Session Log */}
          <div className="mb-4">
            <h6 className="fw-bold text-muted mb-3 text-uppercase small"><FaListUl className="me-2"/> Bitácora de Sesión</h6>
            <StudentSessionLog respuestas={student.respuestas} />
          </div>

        </div>
      </div>
    </div>
  );
}