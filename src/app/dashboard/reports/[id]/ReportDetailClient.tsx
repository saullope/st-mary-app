"use client";

import { useState } from "react";
import { FaTrophy, FaArrowUp, FaArrowDown, FaFilePdf, FaClock, FaExclamationTriangle, FaExternalLinkAlt, FaStar } from "react-icons/fa";
import StudentDetailSidebar from "@/components/dashboard/reports/StudentDetailSidebar";
import TeacherEvaluationToast from "@/components/dashboard/reports/TeacherEvaluationToast";

interface ReportDetailClientProps {
  session: any;
  participantes: any[];
  avgTimeSeconds: number;
  hardestQuestion: { text: string; rate: number } | null;
  hardestRate: number;
  avgClassScore: number;
  avgClassTotalTimeMs: number;
  enableTeacherEvaluation: boolean;
}

export default function ReportDetailClient({ 
  session, 
  participantes, 
  avgTimeSeconds, 
  hardestQuestion, 
  hardestRate, 
  avgClassScore,
  avgClassTotalTimeMs,
  enableTeacherEvaluation
}: ReportDetailClientProps) {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [teacherRating, setTeacherRating] = useState<number | null>(session.teacherRating || null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const handleExportPDF = () => {
    window.print();
  };

  const handleTeacherRating = async (rating: number) => {
    setTeacherRating(rating);
    setSubmittingRating(true);
    try {
      await fetch('/api/play/teacher-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sesionId: session.id.toString(), rating })
      });
    } catch (err) {
      console.error("Error rating:", err);
    } finally {
      setSubmittingRating(false);
    }
  };

  const openStudentDetail = (student: any) => {
    setSelectedStudent(student);
  };

  return (
    <div className="container py-4 print-container">
      {/* Header & Export Action */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 border-bottom pb-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>Reporte: {session.LUDI_ACTIVIDAD.activity.activity_name}</h2>
          <p className="text-muted mb-0">Sesión PIN: <span className="fw-bold text-primary">{session.codigo}</span> | {new Date(session.creada_en).toLocaleDateString()}</p>
        </div>
        <div className="mt-3 mt-md-0 no-print d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-danger shadow-sm d-flex align-items-center rounded-pill px-4"
            onClick={handleExportPDF}
          >
            <FaFilePdf className="me-2" /> Exportar a PDF
          </button>
        </div>
      </div>

      {/* Top Insights Section */}
      <div className="row mb-5 g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-4">
                <FaExclamationTriangle className="text-danger fs-3" />
              </div>
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1">Pregunta Más Difícil</h6>
                <h5 className="fw-bold mb-0 text-dark">
                  {hardestQuestion && hardestRate > 0 
                    ? `"${hardestQuestion?.text}" (${hardestRate}% de fallos)` 
                    : "No hay datos suficientes"}
                </h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4">
                <FaClock className="text-primary fs-3" />
              </div>
              <div>
                <h6 className="text-muted text-uppercase fw-bold mb-1">Tiempo Promedio por Respuesta</h6>
                <h3 className="fw-bold mb-0 text-dark">{avgTimeSeconds} segundos</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Podium - Glassmorphism & Mobile First */}
      <div className="mb-5 p-4 rounded-4 shadow-lg position-relative" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h3 className="text-white text-center fw-bold mb-5 flex-row align-items-center justify-content-center d-flex"><FaTrophy className="me-2 text-warning"/> Podio de Clase</h3>
        
        <div className="row justify-content-center align-items-end" style={{ minHeight: '200px' }}>
          {/* 2nd Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row" onClick={() => participantes[1] && openStudentDetail(participantes[1])} style={{ borderRadius: '15px' }}>
            {participantes[1] && (
              <div className="d-flex flex-column align-items-center p-2">
                {participantes[1].avatar && (
                  <img src={participantes[1].avatar.urlImagen} alt="Avatar" className="rounded-circle mb-2" style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #e2e8f0' }} />
                )}
                <span className="text-white fw-bold text-truncate w-100">{participantes[1].nombre}</span>
                <div className="badge bg-light text-dark my-1">{participantes[1].puntaje_total} pts</div>
                <div className="w-100 mt-2" style={{ height: '80px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: '10px 10px 0 0', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <span className="text-white fs-3 fw-bold mt-2 d-block">2</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 1st Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row" onClick={() => participantes[0] && openStudentDetail(participantes[0])} style={{ borderRadius: '15px' }}>
            {participantes[0] && (
              <div className="d-flex flex-column align-items-center p-2">
                <span className="fs-2 mb-1">👑</span>
                {participantes[0].avatar && (
                  <img src={participantes[0].avatar.urlImagen} alt="Avatar" className="rounded-circle mb-2" style={{ width: '80px', height: '80px', objectFit: 'cover', border: '4px solid #fbbf24' }} />
                )}
                <span className="text-white fw-bold fs-5 text-truncate w-100">{participantes[0].nombre}</span>
                <div className="badge bg-warning text-dark my-1">{participantes[0].puntaje_total} pts</div>
                <div className="w-100 mt-2 shadow" style={{ height: '120px', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)', borderRadius: '10px 10px 0 0', border: '1px solid rgba(255,255,255,0.5)' }}>
                  <span className="text-white fs-1 fw-bold mt-4 d-block">1</span>
                </div>
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row" onClick={() => participantes[2] && openStudentDetail(participantes[2])} style={{ borderRadius: '15px' }}>
            {participantes[2] && (
              <div className="d-flex flex-column align-items-center p-2">
                {participantes[2].avatar && (
                  <img src={participantes[2].avatar.urlImagen} alt="Avatar" className="rounded-circle mb-2" style={{ width: '50px', height: '50px', objectFit: 'cover', border: '3px solid #fca5a5' }} />
                )}
                <span className="text-white fw-bold text-truncate w-100">{participantes[2].nombre}</span>
                <div className="badge bg-light text-dark my-1">{participantes[2].puntaje_total} pts</div>
                <div className="w-100 mt-2" style={{ height: '60px', background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', borderRadius: '10px 10px 0 0', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span className="text-white fs-4 fw-bold mt-2 d-block">3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Identity Table */}
      <h4 className="fw-bold mb-4 text-dark">Desempeño Detallado</h4>
      <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3">Estudiante</th>
                <th className="py-3">Puntaje</th>
                <th className="py-3">Efectividad</th>
                <th className="py-3">Tendencia</th>
                <th className="py-3 text-end no-print">Acción</th>
              </tr>
            </thead>
            <tbody>
              {participantes.map((p) => {
                let pCorrect = 0;
                let pTotal = 0;
                p.respuestas.forEach((r: any) => {
                  pTotal++;
                  if (r.esCorrecta) pCorrect++;
                });
                const effectiveness = pTotal > 0 ? Math.round((pCorrect / pTotal) * 100) : 0;
                const isAboveAverage = p.puntaje_total >= avgClassScore;

                return (
                  <tr key={p.id.toString()} className="clickable-row" onClick={() => openStudentDetail(p)}>
                    <td className="px-4 py-3 d-flex align-items-center border-0">
                      {p.avatar ? (
                        <img src={p.avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-sm me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="fw-bold text-dark">{p.nombre}</span>
                    </td>
                    <td className="py-3 fw-bold text-primary border-0">{p.puntaje_total} pts</td>
                    <td className="py-3 border-0">
                      <div className="d-flex align-items-center">
                        <span className={`me-2 fw-bold ${effectiveness >= 70 ? 'text-success' : effectiveness >= 50 ? 'text-warning' : 'text-danger'}`}>
                          {effectiveness}%
                        </span>
                        <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                          <div className={`progress-bar ${effectiveness >= 70 ? 'bg-success' : effectiveness >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${effectiveness}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 border-0">
                      {isAboveAverage ? (
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 d-inline-flex align-items-center">
                          <FaArrowUp className="me-1" /> Sobre Promedio
                        </span>
                      ) : (
                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 d-inline-flex align-items-center">
                          <FaArrowDown className="me-1" /> Bajo Promedio
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-end px-4 border-0 no-print">
                       <button className="btn btn-sm btn-light text-primary rounded-circle" style={{ width: '35px', height: '35px' }}>
                         <FaExternalLinkAlt />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {participantes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted border-0">No hay estudiantes en esta sesión.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar Component */}
      <div className="no-print">
        {selectedStudent && (
          <StudentDetailSidebar 
            student={selectedStudent} 
            avgClassScore={avgClassScore} 
            avgClassTotalTimeMs={avgClassTotalTimeMs}
            onClose={() => setSelectedStudent(null)} 
          />
        )}
      </div>

      {enableTeacherEvaluation && teacherRating === null && (
        <TeacherEvaluationToast 
          activityId={session.activity_id.toString()}
          grade={session.LUDI_ACTIVIDAD?.grado?.grade_type_name || "su clase"}
          initialRating={teacherRating}
          onRate={handleTeacherRating}
        />
      )}
    </div>
  );
}