"use client";

import { useState } from "react";
import { FaTrophy, FaArrowUp, FaArrowDown, FaFilePdf, FaClock, FaExclamationTriangle, FaExternalLinkAlt, FaArrowLeft } from "react-icons/fa";
import StudentDetailSidebar from "@/components/dashboard/reports/StudentDetailSidebar";
import TeacherEvaluationToast from "@/components/dashboard/reports/TeacherEvaluationToast";
import Link from "next/link";

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
    <div className="container py-4 print-container" style={{ maxWidth: '1200px' }}>
      {/* Breadcrumb Navigation */}
      <div className="mb-4 no-print">
        <Link href="/dashboard/reports" className="badge d-inline-flex align-items-center shadow-sm" style={{ background: '#E8E5F7', color: '#1D153A', padding: '0.6rem 1.2rem', borderRadius: '2rem', fontSize: '0.9rem', textDecoration: 'none', border: '1px solid rgba(29, 21, 58, 0.1)', transition: 'all 0.2s ease' }}>
          <FaArrowLeft className="me-2" /> 
          Reportes <span className="mx-2" style={{ opacity: 0.5 }}>/</span> <span className="fw-bold">{session.LUDI_ACTIVIDAD.activity.activity_name}</span>
        </Link>
      </div>

      {/* Header & Export Action */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 pb-3" style={{ borderBottom: '2px dashed rgba(255,255,255,0.1)' }}>
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#E8E5F7' }}>Reporte: {session.LUDI_ACTIVIDAD.activity.activity_name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Sesión PIN: <span className="fw-bold" style={{ color: '#E8E5F7' }}>{session.codigo}</span> | {new Date(session.creada_en).toLocaleDateString()}</p>
        </div>
        <div className="mt-3 mt-md-0 no-print d-flex align-items-center gap-3">
          <button 
            className="btn shadow-sm d-flex align-items-center rounded-pill px-4"
            style={{ background: '#1D153A', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={handleExportPDF}
          >
            <FaFilePdf className="me-2" style={{ color: '#dc3545' }} /> Exportar a PDF
          </button>
        </div>
      </div>

      {/* Top Insights Section */}
      <div className="row mb-5 g-4">
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '1.5rem', background: '#E8E5F7', border: '1px solid rgba(29, 21, 58, 0.05)' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="p-3 rounded-circle me-4" style={{ background: 'rgba(220, 53, 69, 0.1)' }}>
                <FaExclamationTriangle className="fs-3" style={{ color: '#dc3545' }} />
              </div>
              <div>
                <h6 className="text-uppercase fw-bold mb-1" style={{ color: '#4a4266' }}>Pregunta Más Difícil</h6>
                <h5 className="fw-bold mb-0" style={{ color: '#1D153A' }}>
                  {hardestQuestion && hardestRate > 0 
                    ? `"${hardestQuestion?.text}" (${hardestRate}% de fallos)` 
                    : "No hay datos suficientes"}
                </h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '1.5rem', background: '#E8E5F7', border: '1px solid rgba(29, 21, 58, 0.05)' }}>
            <div className="card-body p-4 d-flex align-items-center">
              <div className="p-3 rounded-circle me-4" style={{ background: 'rgba(106, 75, 255, 0.1)' }}>
                <FaClock className="fs-3" style={{ color: '#1D153A' }} />
              </div>
              <div>
                <h6 className="text-uppercase fw-bold mb-1" style={{ color: '#4a4266' }}>Tiempo Promedio por Respuesta</h6>
                <h3 className="fw-bold mb-0" style={{ color: '#1D153A' }}>{avgTimeSeconds} segundos</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Podium - Lavender Theme */}
      <div className="mb-5 p-4 rounded-4 shadow-lg position-relative" style={{ background: '#E8E5F7', border: '1px solid rgba(29, 21, 58, 0.05)' }}>
        <h3 className="text-center fw-bold mb-5 flex-row align-items-center justify-content-center d-flex" style={{ color: '#1D153A' }}>
            <FaTrophy className="me-2" style={{ color: '#e5b869' }}/> Podio de Clase
        </h3>
        
        <div className="row justify-content-center align-items-end" style={{ minHeight: '200px' }}>
          {/* 2nd Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row position-relative" onClick={() => participantes[1] && openStudentDetail(participantes[1])} style={{ borderRadius: '15px', zIndex: 2, cursor: 'pointer' }}>
            {participantes[1] && (
              <div className="d-flex flex-column align-items-center p-2">
                {participantes[1].avatar && (
                  <img src={participantes[1].avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-lg mb-2" style={{ width: '70px', height: '70px', objectFit: 'cover', border: '3px solid #cbd5e1' }} />
                )}
                <span className="fw-bold text-truncate w-100" style={{ color: '#1D153A' }}>{participantes[1].nombre}</span>
                <div className="badge bg-secondary rounded-pill my-1 fs-6">2º LUGAR</div>
                <div className="fw-bold fs-5" style={{ color: '#4a4266' }}>{participantes[1].puntaje_total} pts</div>
                <div className="w-100 mt-2 border rounded-top shadow-sm" style={{ height: '100px', background: 'linear-gradient(to top, #cbd5e1, #f8fafc)', borderBottom: 'none' }}>
                  <span className="fs-3 fw-bold mt-3 d-block" style={{ color: '#64748b' }}>2</span>
                </div>
              </div>
            )}
          </div>
          
          {/* 1st Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row position-relative" onClick={() => participantes[0] && openStudentDetail(participantes[0])} style={{ borderRadius: '15px', zIndex: 3, cursor: 'pointer' }}>
            {participantes[0] && (
              <div className="d-flex flex-column align-items-center p-2">
                <span className="fs-1 mb-2 d-block">👑</span>
                {participantes[0].avatar && (
                  <img src={participantes[0].avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-lg mb-2" style={{ width: '90px', height: '90px', objectFit: 'cover', border: '4px solid #fbbf24' }} />
                )}
                <span className="fw-bold fs-5 text-truncate w-100" style={{ color: '#1D153A' }}>{participantes[0].nombre}</span>
                <div className="badge bg-warning text-dark rounded-pill my-1 fs-5 shadow-sm">1º LUGAR</div>
                <div className="fw-bold fs-4" style={{ color: '#198754' }}>{participantes[0].puntaje_total} pts</div>
                <div className="w-100 mt-2 shadow border rounded-top" style={{ height: '150px', background: 'linear-gradient(to top, #fbbf24, #fef3c7)', borderBottom: 'none' }}>
                  <span className="text-dark fs-1 fw-bold mt-4 d-block">1</span>
                </div>
              </div>
            )}
          </div>

          {/* 3rd Place */}
          <div className="col-4 text-center px-1 px-md-3 clickable-row position-relative" onClick={() => participantes[2] && openStudentDetail(participantes[2])} style={{ borderRadius: '15px', zIndex: 1, cursor: 'pointer' }}>
            {participantes[2] && (
              <div className="d-flex flex-column align-items-center p-2">
                {participantes[2].avatar && (
                  <img src={participantes[2].avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-lg mb-2" style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #fca5a5' }} />
                )}
                <span className="fw-bold text-truncate w-100" style={{ color: '#1D153A' }}>{participantes[2].nombre}</span>
                <div className="badge rounded-pill my-1" style={{ backgroundColor: '#cd7f32', color: 'white' }}>3º LUGAR</div>
                <div className="fw-bold fs-6" style={{ color: '#4a4266' }}>{participantes[2].puntaje_total} pts</div>
                <div className="w-100 mt-2 border rounded-top shadow-sm" style={{ height: '70px', background: 'linear-gradient(to top, #fed7aa, #fff7ed)', borderBottom: 'none' }}>
                  <span className="fs-4 fw-bold mt-2 d-block" style={{ color: '#c2410c' }}>3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Identity Table */}
      <h4 className="fw-bold mb-4" style={{ color: '#E8E5F7' }}>Desempeño Detallado</h4>
      <div className="card border-0 shadow-sm" style={{ borderRadius: '1.5rem', overflow: 'hidden', background: '#E8E5F7' }}>
        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ background: 'transparent' }}>
            <thead style={{ borderBottom: '2px solid rgba(29, 21, 58, 0.1)' }}>
              <tr>
                <th className="px-4 py-3" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Estudiante</th>
                <th className="py-3" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Puntaje</th>
                <th className="py-3" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Efectividad</th>
                <th className="py-3" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Tendencia</th>
                <th className="py-3 text-end no-print" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Acción</th>
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
                  <tr key={p.id.toString()} className="clickable-row" onClick={() => openStudentDetail(p)} style={{ borderBottom: '1px solid rgba(29, 21, 58, 0.05)', cursor: 'pointer' }}>
                    <td className="px-4 py-3 d-flex align-items-center border-0" style={{ background: 'transparent' }}>
                      {p.avatar ? (
                        <img src={p.avatar.urlImagen} alt="Avatar" className="rounded-circle shadow-sm me-3" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="fw-bold" style={{ color: '#1D153A' }}>{p.nombre}</span>
                    </td>
                    <td className="py-3 fw-bold border-0" style={{ background: 'transparent', color: '#1D153A' }}>{p.puntaje_total} pts</td>
                    <td className="py-3 border-0" style={{ background: 'transparent' }}>
                      <div className="d-flex align-items-center">
                        <span className="me-2 fw-bold" style={{ color: effectiveness >= 70 ? '#198754' : effectiveness >= 50 ? '#e5b869' : '#dc3545' }}>
                          {effectiveness}%
                        </span>
                        <div className="progress flex-grow-1 shadow-sm" style={{ height: '6px', maxWidth: '100px', backgroundColor: 'rgba(29, 21, 58, 0.1)' }}>
                          <div className="progress-bar" style={{ width: `${effectiveness}%`, backgroundColor: effectiveness >= 70 ? '#198754' : effectiveness >= 50 ? '#e5b869' : '#dc3545' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 border-0" style={{ background: 'transparent' }}>
                      {isAboveAverage ? (
                        <span className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center" style={{ background: 'rgba(25, 135, 84, 0.15)', color: '#198754' }}>
                          <FaArrowUp className="me-1" /> Sobre Promedio
                        </span>
                      ) : (
                        <span className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center" style={{ background: 'rgba(220, 53, 69, 0.15)', color: '#dc3545' }}>
                          <FaArrowDown className="me-1" /> Bajo Promedio
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-end px-4 border-0 no-print" style={{ background: 'transparent' }}>
                       <button className="btn btn-sm rounded-circle shadow-sm" style={{ width: '35px', height: '35px', background: 'white', color: '#1D153A', border: '1px solid rgba(29, 21, 58, 0.1)' }}>
                         <FaExternalLinkAlt />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {participantes.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted border-0" style={{ background: 'transparent' }}>No hay estudiantes en esta sesión.</td>
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