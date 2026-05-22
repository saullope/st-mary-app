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
    <div className="student-sidebar-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div className="student-sidebar-content d-flex flex-column" onClick={e => e.stopPropagation()} style={{ background: '#E8E5F7', borderLeft: '1px solid rgba(29,21,58,0.1)' }}>
        {/* Sticky Header */}
        <div className="p-3 border-bottom d-flex flex-column shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 1060, background: '#E8E5F7', borderColor: 'rgba(29,21,58,0.1) !important' }}>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex align-items-center gap-3">
              {student.avatar ? (
                <img src={student.avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-sm" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '2px solid white' }} />
              ) : (
                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', fontSize: '24px' }}>
                  {student.nombre.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#1D153A' }}>{student.nombre}</h5>
                <div className="small" style={{ color: '#4a4266' }}>
                  Score: <strong style={{ color: isAboveAverage ? '#198754' : '#dc3545' }}>{student.puntaje_total} pts</strong>
                </div>
              </div>
            </div>
            <button className="btn btn-close shadow-none" onClick={onClose} aria-label="Close"></button>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-2 px-3 py-2 rounded-3 border" style={{ background: 'rgba(29, 21, 58, 0.05)', borderColor: 'rgba(29, 21, 58, 0.1) !important' }}>
            <span className="small fw-bold" style={{ color: '#4a4266' }}>Tiempo Total:</span>
            <span className="small fw-bold" style={{ color: '#1D153A' }}>{(studentTotalTimeMs / 1000).toFixed(1)} s</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 flex-grow-1 overflow-auto" style={{ background: '#fdfdfd' }}>
          {/* Stats Section */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: '#1D153A' }}><FaChartLine className="me-2"/> Rendimiento General</h6>
            
            <div className="card bg-white border-0 shadow-sm rounded-4 p-3 mb-3" style={{ border: '1px solid rgba(29,21,58,0.05) !important' }}>
              <div className="d-flex justify-content-between mb-1">
                <span className="small fw-bold" style={{ color: '#4a4266' }}>Efectividad Global</span>
                <span className="small fw-bold" style={{ color: '#1D153A' }}>{effectiveness}%</span>
              </div>
              <div className="progress" style={{ height: '8px', background: 'rgba(29,21,58,0.1)' }}>
                <div className="progress-bar" style={{ width: `${effectiveness}%`, background: '#1D153A' }}></div>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <div className="card bg-white border-0 shadow-sm rounded-4 p-3 h-100 text-center" style={{ border: '1px solid rgba(29,21,58,0.05) !important' }}>
                  <small className="d-block mb-1" style={{ color: '#4a4266' }}>Promedio Clase</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <strong className="fs-6" style={{ color: '#1D153A' }}>{Math.round(avgClassScore)} pts</strong>
                    <FaBullseye style={{ color: isAboveAverage ? '#198754' : '#dc3545' }} />
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card bg-white border-0 shadow-sm rounded-4 p-3 h-100 text-center" style={{ border: '1px solid rgba(29,21,58,0.05) !important' }}>
                  <small className="d-block mb-1" style={{ color: '#4a4266' }}>Ritmo de Trabajo</small>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <strong className="fs-6" style={{ color: '#1D153A' }}>{effortLabel}</strong>
                    <FaBolt className={effortLabel === 'Rápido' ? 'text-warning' : effortLabel === 'Analítico' ? 'text-info' : 'text-secondary'} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-4" style={{ borderColor: 'rgba(29,21,58,0.1)' }} />

          {/* Chronological Session Log */}
          <div className="mb-4">
            <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: '#1D153A' }}><FaListUl className="me-2"/> Bitácora de Sesión</h6>
            <StudentSessionLog respuestas={student.respuestas} />
          </div>

        </div>
      </div>
    </div>
  );
}