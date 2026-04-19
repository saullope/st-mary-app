"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Star, Smile, AlertCircle } from "lucide-react";

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

  return (
    <div className="card border-0 shadow-xl rounded-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 text-muted small text-uppercase">Educador</th>
              <th className="py-3 text-muted small text-uppercase">Actividad</th>
              <th className="py-3 text-muted small text-uppercase">Tipo</th>
              <th className="py-3 text-muted small text-uppercase">Grado</th>
              <th className="py-3 text-muted small text-uppercase">Fecha</th>
              <th className="py-3 text-center text-muted small text-uppercase">Scores (Prof/Est)</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => {
              const isExpanded = expandedRow === session.id.toString();
              
              return (
                <React.Fragment key={session.id.toString()}>
                  <tr 
                    onClick={() => toggleRow(session.id.toString())} 
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                    className={isExpanded ? "bg-primary bg-opacity-10" : ""}
                  >
                    <td className="py-3 px-4">
                      <div className="fw-bold text-dark">{session.user?.nombre || "Usuario Desconocido"}</div>
                      <div className="small text-muted">{session.user?.email || "Sin email"}</div>
                    </td>
                    <td className="py-3 fw-bold text-primary">
                      {session.LUDI_ACTIVIDAD?.activity?.activity_name || "Actividad"}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${session.LUDI_ACTIVIDAD?.temaId ? 'bg-info' : 'bg-secondary'}`}>
                        {session.LUDI_ACTIVIDAD?.temaId ? 'Plantilla' : 'Personalizada'}
                      </span>
                    </td>
                    <td className="py-3 fw-medium">
                      {session.LUDI_ACTIVIDAD?.grado?.grade_type_name || "Sin grado"}
                    </td>
                    <td className="py-3 small text-muted">
                      {session.finalizada_en ? new Date(session.finalizada_en).toLocaleDateString() : "En curso"}
                    </td>
                    <td className="py-3 text-center">
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <div className="d-flex align-items-center" title="Utilidad (Docente)">
                          <Star size={16} className="text-warning me-1" />
                          <span className="fw-bold">{session.teacherRating ? session.teacherRating.toFixed(1) : "-"}</span>
                        </div>
                        <div className="d-flex align-items-center" title="Diversión (Estudiante)">
                          <Smile size={16} className="text-success me-1" />
                          <span className="fw-bold">{session.avgStudentFun ? session.avgStudentFun.toFixed(1) : "-"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end">
                      {isExpanded ? <ChevronUp className="text-muted" /> : <ChevronDown className="text-muted" />}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="p-0 border-0">
                        <div className="bg-light p-4 border-bottom shadow-inner" style={{ boxShadow: 'inset 0 4px 6px -4px rgba(0, 0, 0, 0.1)' }}>
                          <div className="row g-4">
                            
                            {/* Question Stats */}
                            <div className="col-12 col-md-6">
                              <h6 className="fw-bold text-dark mb-3"><AlertCircle size={18} className="me-2 text-primary" /> Estadísticas por Pregunta</h6>
                              <div className="card border-0 shadow-sm rounded-3">
                                <ul className="list-group list-group-flush rounded-3">
                                  {session.questionStats && session.questionStats.length > 0 ? (
                                    session.questionStats.map((q: any, idx: number) => (
                                      <li key={idx} className="list-group-item d-flex justify-content-between align-items-center p-3">
                                        <span className="text-truncate fw-medium" style={{ maxWidth: '60%' }}>{q.texto}</span>
                                        <div className="d-flex gap-2">
                                          <span className="badge bg-success bg-opacity-25 text-success border border-success rounded-pill px-2">Acierto: {q.acierto}%</span>
                                          <span className="badge bg-danger bg-opacity-25 text-danger border border-danger rounded-pill px-2">Error: {q.error}%</span>
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="list-group-item p-3 text-muted text-center small">Sin datos de preguntas.</li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            {/* Student List */}
                            <div className="col-12 col-md-6">
                              <h6 className="fw-bold text-dark mb-3"><Smile size={18} className="me-2 text-info" /> Estudiantes ({session.LUDI_SESION_PARTICIPANTE?.length || 0})</h6>
                              <div className="card border-0 shadow-sm rounded-3 overflow-hidden" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                <table className="table table-sm table-hover mb-0 align-middle">
                                  <thead className="table-light sticky-top">
                                    <tr>
                                      <th className="ps-3">Estudiante</th>
                                      <th className="text-center">Puntaje</th>
                                      <th className="text-center pe-3">Feedback</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {session.LUDI_SESION_PARTICIPANTE && session.LUDI_SESION_PARTICIPANTE.length > 0 ? (
                                      session.LUDI_SESION_PARTICIPANTE.map((p: any) => (
                                        <tr key={p.id.toString()}>
                                          <td className="ps-3 py-2 d-flex align-items-center">
                                            {p.avatar ? (
                                              <img src={p.avatar.urlImagen} alt="Avatar" className="rounded-circle me-2 object-fit-cover" style={{ width: '28px', height: '28px' }} />
                                            ) : (
                                              <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                                                {p.nombre.charAt(0).toUpperCase()}
                                              </div>
                                            )}
                                            <span className="small fw-bold">{p.nombre}</span>
                                          </td>
                                          <td className="text-center py-2 small fw-bold text-primary">{p.puntaje_total}</td>
                                          <td className="text-center pe-3 py-2 small text-muted">
                                            {p.studentEnjoyment ? p.studentEnjoyment.toFixed(1) : "-"}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="text-center text-muted small py-3">Sin participantes.</td>
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
                <td colSpan={7} className="text-center py-5 text-muted">No se encontraron sesiones registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}