"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Star, Smile, AlertCircle, BookOpen, Target, Activity, Download } from "lucide-react";
import styles from "@/styles/pages/my-activities.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AdminReportsTableProps {
  sessions: any[];
}

export default function AdminReportsTable({ sessions }: AdminReportsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  const handleExportPDF = (session: any) => {
    const doc = new jsPDF();
    const docWidth = doc.internal.pageSize.getWidth();

    // Headers
    doc.setFontSize(18);
    doc.text(`Reporte Analitico: ${session.LUDI_ACTIVIDAD?.activity?.activity_name}`, 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Educador: ${session.user?.nombre} (${session.user?.email})`, 14, 28);
    doc.text(`Fecha: ${session.finalizada_en ? new Date(session.finalizada_en).toLocaleDateString() : "En curso"}`, 14, 34);
    
    // Teacher Evaluation
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Evaluacion Docente", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Rating', 'Objetivo Cumplido', 'Dificultad Reportada']],
      body: [[
        session.teacherRating ? `${session.teacherRating.toFixed(1)}/5` : "N/A",
        session.objectiveMet === true ? "Si" : session.objectiveMet === false ? "No" : "N/A",
        session.templateDifficulty || "N/A"
      ]],
      theme: 'grid',
      headStyles: { fillColor: [106, 75, 255] }
    });

    // Students
    doc.text("Participantes y Rendimiento", 14, (doc as any).lastAutoTable.finalY + 15);
    
    const studentsData = session.LUDI_SESION_PARTICIPANTE?.map((p: any) => [
      p.nombre,
      p.puntaje_total,
      p.studentEnjoyment ? `${p.studentEnjoyment.toFixed(1)}/5` : "N/A",
      p.studentLearning ? `${p.studentLearning.toFixed(1)}/5` : "N/A"
    ]) || [];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Estudiante', 'Puntaje', 'Diversion', 'Aprendizaje']],
      body: studentsData,
      theme: 'striped',
      headStyles: { fillColor: [29, 21, 58] }
    });

    // Question Stats
    if (session.questionStats && session.questionStats.length > 0) {
      doc.text("Estadisticas por Pregunta", 14, (doc as any).lastAutoTable.finalY + 15);
      const questionData = session.questionStats.map((q: any) => [
        q.texto,
        `${q.acierto}%`,
        `${q.error}%`
      ]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Pregunta', 'Acierto', 'Error']],
        body: questionData,
        theme: 'plain',
        headStyles: { fillColor: [220, 53, 69] }
      });
    }

    doc.save(`Reporte_LudiGame_${session.id}.pdf`);
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: '#E8E5F7', border: '1px solid rgba(29, 21, 58, 0.05)' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ background: 'transparent' }}>
          <thead style={{ borderBottom: '2px solid rgba(29, 21, 58, 0.1)' }}>
            <tr>
              <th className="py-3 px-4 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Educador</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Actividad</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Tipo</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Grado</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Fecha</th>
              <th className="py-3 text-center small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>Scores (Prof/Est)</th>
              <th className="py-3 px-4" style={{ background: 'transparent', borderBottom: 'none' }}></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const isExpanded = expandedRow === session.id.toString();
              
              return (
                <React.Fragment key={session.id.toString()}>
                  <tr 
                    onClick={() => toggleRow(session.id.toString())} 
                    style={{ 
                        cursor: "pointer", 
                        transition: "background-color 0.2s", 
                        borderBottom: '1px solid rgba(29, 21, 58, 0.05)',
                        backgroundColor: isExpanded ? 'rgba(255,255,255,0.4)' : 'transparent'
                    }}
                  >
                    <td className="py-3 px-4 border-0" style={{ background: 'transparent' }}>
                      <div className="fw-bold" style={{ color: '#1D153A' }}>{session.user?.nombre || "Usuario Desconocido"}</div>
                      <div className="small" style={{ color: '#4a4266' }}>{session.user?.email || "Sin email"}</div>
                    </td>
                    <td className="py-3 fw-bold border-0" style={{ background: 'transparent', color: '#1D153A' }}>
                      {session.LUDI_ACTIVIDAD?.activity?.activity_name || "Actividad"}
                    </td>
                    <td className="py-3 border-0" style={{ background: 'transparent' }}>
                      <span className="badge rounded-pill" style={{ background: session.LUDI_ACTIVIDAD?.temaId ? 'rgba(106, 75, 255, 0.1)' : 'rgba(29, 21, 58, 0.1)', color: session.LUDI_ACTIVIDAD?.temaId ? '#6a4bff' : '#1D153A' }}>
                        {session.LUDI_ACTIVIDAD?.temaId ? 'Plantilla' : 'Personalizada'}
                      </span>
                    </td>
                    <td className="py-3 fw-medium border-0" style={{ background: 'transparent', color: '#4a4266' }}>
                      {session.LUDI_ACTIVIDAD?.grado?.grade_type_name || "Sin grado"}
                    </td>
                    <td className="py-3 small border-0" style={{ background: 'transparent', color: '#4a4266' }}>
                      {session.finalizada_en ? new Date(session.finalizada_en).toLocaleDateString() : "En curso"}
                    </td>
                    <td className="py-3 text-center border-0" style={{ background: 'transparent' }}>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <div className="d-flex align-items-center" title="Utilidad (Docente)">
                          <Star size={16} className="me-1" style={{ color: '#e5b869' }} />
                          <span className="fw-bold" style={{ color: '#1D153A' }}>{session.teacherRating ? session.teacherRating.toFixed(1) : "-"}</span>
                        </div>
                        <div className="d-flex align-items-center" title="Diversión (Estudiante)">
                          <Smile size={16} className="me-1" style={{ color: '#198754' }} />
                          <span className="fw-bold" style={{ color: '#1D153A' }}>{session.avgStudentFun ? session.avgStudentFun.toFixed(1) : "-"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end border-0" style={{ background: 'transparent' }}>
                      {isExpanded ? <ChevronUp style={{ color: '#1D153A' }} /> : <ChevronDown style={{ color: '#4a4266' }} />}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="p-0 border-0">
                        <div className="p-4 shadow-sm" style={{ background: '#fdfdfd', borderBottom: '2px solid rgba(29, 21, 58, 0.1)' }}>
                          <div className="row g-4">
                            
                            {/* Detailed Teacher Feedback */}
                            <div className="col-12 mb-2">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <h6 className="fw-bold text-uppercase small m-0" style={{ color: '#1D153A' }}>
                                      <BookOpen size={16} className="me-2" style={{ color: '#6a4bff' }} /> 
                                      Resumen de Salud de la Actividad
                                  </h6>
                                  <button 
                                    className="btn btn-sm d-flex align-items-center shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); handleExportPDF(session); }}
                                    style={{ background: '#1D153A', color: 'white', borderRadius: '1rem', padding: '0.4rem 1rem' }}
                                  >
                                    <Download size={14} className="me-2" style={{ color: '#00d4ff' }} /> Exportar Pdf
                                  </button>
                                </div>
                                <div className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row flex-wrap gap-4 align-items-center" style={{ background: 'rgba(29, 21, 58, 0.03)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>Evaluación Docente:</span>
                                        <div className="badge rounded-pill px-3 py-2 d-flex align-items-center" style={{ background: 'white', color: '#1D153A', border: '1px solid rgba(229, 184, 105, 0.5)' }}>
                                            <Star size={14} className="me-1" fill="#e5b869" color="#e5b869" /> 
                                            {session.teacherRating ? `${session.teacherRating.toFixed(1)}/5` : "N/A"}
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>Objetivo:</span>
                                        {session.objectiveMet === true ? (
                                            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}><Target size={14} className="me-1"/> Cumplido</span>
                                        ) : session.objectiveMet === false ? (
                                            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}><Target size={14} className="me-1"/> No Cumplido</span>
                                        ) : (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">N/A</span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>Disfrute Estudiantil:</span>
                                        <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(106, 75, 255, 0.1)', color: '#6a4bff' }}>
                                            <Smile size={14} className="me-1" /> 
                                            {session.avgStudentFun ? `${session.avgStudentFun.toFixed(1)}/5` : "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Hardest Question Alert */}
                            <div className="col-12 col-md-4">
                              <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: '#1D153A' }}>
                                <AlertCircle size={16} className="me-2" style={{ color: '#dc3545' }} /> 
                                Alerta de Contenido
                              </h6>
                              <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2) !important' }}>
                                {session.hardestQuestion ? (
                                    <>
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge rounded-pill me-2" style={{ background: '#dc3545', color: 'white' }}>Pregunta Más Difícil</span>
                                            <span className="small fw-bold" style={{ color: '#dc3545' }}>{session.hardestQuestion.error}% Fallos</span>
                                        </div>
                                        <p className="mb-0 fw-bold" style={{ color: '#1D153A' }}>"{session.hardestQuestion.texto}"</p>
                                        <p className="small text-muted mt-2 mb-0">Se recomienda reforzar este tema con el grupo.</p>
                                    </>
                                ) : (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                                        <p className="mb-0 small" style={{ color: '#4a4266' }}>No hay datos suficientes para determinar un patrón de error.</p>
                                    </div>
                                )}
                              </div>
                            </div>

                            {/* Student List */}
                            <div className="col-12 col-md-8">
                              <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: '#1D153A' }}>
                                <Smile size={16} className="me-2" style={{ color: '#198754' }} /> 
                                Participantes ({session.LUDI_SESION_PARTICIPANTE?.length || 0})
                              </h6>
                              <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(29,21,58,0.05)' }}>
                                <table className="table table-hover mb-0 align-middle">
                                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E8E5F7' }}>
                                    <tr>
                                      <th className="ps-3 border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>Estudiante</th>
                                      <th className="text-center border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>Puntaje</th>
                                      <th className="text-center pe-3 border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>Recepción</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {session.LUDI_SESION_PARTICIPANTE && session.LUDI_SESION_PARTICIPANTE.length > 0 ? (
                                      session.LUDI_SESION_PARTICIPANTE.map((p: any) => (
                                        <tr key={p.id.toString()} style={{ borderBottom: '1px solid rgba(29,21,58,0.05)' }}>
                                          <td className="ps-3 py-2 d-flex align-items-center border-0">
                                            {p.avatar ? (
                                              <img src={p.avatar.urlImagen} alt="Avatar" className="rounded-circle me-2 object-fit-cover shadow-sm" style={{ width: '28px', height: '28px' }} />
                                            ) : (
                                              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                                                {p.nombre.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            <span className="small fw-bold" style={{ color: '#1D153A' }}>{p.nombre}</span>
                                          </td>
                                          <td className="text-center py-2 small fw-bold border-0" style={{ color: '#1D153A' }}>{p.puntaje_total}</td>
                                          <td className="text-center py-2 border-0">
                                              {p.studentEnjoyment ? (
                                                  p.studentEnjoyment >= 4 ? <span title="Excelente">💚</span> :
                                                  p.studentEnjoyment >= 3 ? <span title="Regular">💛</span> :
                                                  <span title="Bajo">❤️</span>
                                              ) : (
                                                  <span className="text-muted small">-</span>
                                              )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="text-center py-4 small" style={{ color: '#4a4266' }}>Sin participantes registrados.</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {sessions.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-5" style={{ color: '#4a4266' }}>No se encontraron sesiones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}