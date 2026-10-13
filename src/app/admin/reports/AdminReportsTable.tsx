"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Star, Smile, AlertCircle, BookOpen, Target, Activity, Download } from "lucide-react";
import styles from "@/styles/pages/my-activities.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFormatter, useTranslations } from "next-intl";
import { OBJECTIVE_LEVELS } from "@/features/followUp/followUp";

const OBJECTIVE_BADGE: Record<number, { background: string; color: string }> = {
  [OBJECTIVE_LEVELS.yes]: { background: 'rgba(25, 135, 84, 0.1)', color: '#198754' },
  [OBJECTIVE_LEVELS.partial]: { background: 'rgba(229, 184, 105, 0.2)', color: '#8a5a00' },
  [OBJECTIVE_LEVELS.no]: { background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' },
};

interface AdminReportsTableProps {
  sessions: any[];
}

export default function AdminReportsTable({ sessions }: AdminReportsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const t = useTranslations("FollowUp");
  const ts = useTranslations("AdminSessions");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const formatDate = (value: string | Date) => format.dateTime(new Date(value), { dateStyle: "medium" });
  const objectiveLabel = (level: number | null) =>
    level === 0 || level === 1 || level === 2 ? t(`teacher.objectiveOptions.${level}`) : ts("notAvailable");

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
    doc.text(ts("pdfTitle", { name: session.LUDI_ACTIVIDAD?.activity?.activity_name ?? "" }), 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(ts("pdfTeacher", { name: session.user?.nombre ?? "", email: session.user?.email ?? "" }), 14, 28);
    doc.text(ts("pdfDate", { date: session.finalizada_en ? formatDate(session.finalizada_en) : ts("inProgress") }), 14, 34);
    
    // Teacher Evaluation
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(ts("pdfTeacherEvaluation"), 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [[ts("pdfRating"), ts("pdfObjective"), ts("pdfDifficulty")]],
      body: [[
        session.teacherRating ? `${session.teacherRating.toFixed(1)}/5` : ts("notAvailable"),
        objectiveLabel(session.objectiveLevel),
        session.templateDifficulty ? t(`teacher.difficultyOptions.${session.templateDifficulty as "BAJA" | "ADECUADA" | "ALTA"}`) : ts("notAvailable")
      ]],
      theme: 'grid',
      headStyles: { fillColor: [106, 75, 255] }
    });

    // Students
    doc.text(ts("pdfParticipants"), 14, (doc as any).lastAutoTable.finalY + 15);
    
    const studentsData = session.LUDI_SESION_PARTICIPANTE?.map((p: any) => [
      p.nombre,
      p.puntaje_total,
      p.studentEnjoyment ? `${p.studentEnjoyment.toFixed(1)}/5` : ts("notAvailable"),
      p.studentLearning ? `${p.studentLearning.toFixed(1)}/5` : ts("notAvailable")
    ]) || [];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [[ts("student"), ts("score"), ts("enjoyment"), ts("learning")]],
      body: studentsData,
      theme: 'striped',
      headStyles: { fillColor: [29, 21, 58] }
    });

    // Question Stats
    if (session.questionStats && session.questionStats.length > 0) {
      doc.text(ts("pdfQuestionStats"), 14, (doc as any).lastAutoTable.finalY + 15);
      const questionData = session.questionStats.map((q: any) => [
        q.texto,
        `${q.acierto}%`,
        `${q.error}%`
      ]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [[ts("question"), ts("hit"), ts("miss")]],
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
              <th className="py-3 px-4 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("teacher")}</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("activity")}</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("type")}</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("grade")}</th>
              <th className="py-3 small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("date")}</th>
              <th className="py-3 text-center small text-uppercase" style={{ background: 'transparent', color: '#4a4266', borderBottom: 'none' }}>{ts("scores")}</th>
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
                      <div className="fw-bold" style={{ color: '#1D153A' }}>{session.user?.nombre || ts("unknownUser")}</div>
                      <div className="small" style={{ color: '#4a4266' }}>{session.user?.email || ts("noEmail")}</div>
                    </td>
                    <td className="py-3 fw-bold border-0" style={{ background: 'transparent', color: '#1D153A' }}>
                      {session.LUDI_ACTIVIDAD?.activity?.activity_name || ts("activity")}
                    </td>
                    <td className="py-3 border-0" style={{ background: 'transparent' }}>
                      {/* temaId es el fondo visual; el origen real de la copia es plantillaOrigenId. */}
                      <span className="badge rounded-pill" style={{ background: session.LUDI_ACTIVIDAD?.plantillaOrigenId != null ? 'rgba(106, 75, 255, 0.1)' : 'rgba(29, 21, 58, 0.1)', color: session.LUDI_ACTIVIDAD?.plantillaOrigenId != null ? '#6a4bff' : '#1D153A' }}>
                        {t(session.LUDI_ACTIVIDAD?.plantillaOrigenId != null ? "admin.typeTemplateCopy" : "admin.typeOwn")}
                      </span>
                    </td>
                    <td className="py-3 fw-medium border-0" style={{ background: 'transparent', color: '#4a4266' }}>
                      {session.LUDI_ACTIVIDAD?.gradoId ? tCommon(`grades.${session.LUDI_ACTIVIDAD.gradoId as 1 | 2 | 3}`) : tCommon("noGrade")}
                    </td>
                    <td className="py-3 small border-0" style={{ background: 'transparent', color: '#4a4266' }}>
                      {session.finalizada_en ? formatDate(session.finalizada_en) : ts("inProgress")}
                    </td>
                    <td className="py-3 text-center border-0" style={{ background: 'transparent' }}>
                      <div className="d-flex justify-content-center align-items-center gap-3">
                        <div className="d-flex align-items-center" title={ts("teacherRating")}>
                          <Star size={16} className="me-1" style={{ color: '#e5b869' }} aria-label={ts("teacherRating")} role="img" />
                          <span className="fw-bold" style={{ color: '#1D153A' }}>{session.teacherRating ? session.teacherRating.toFixed(1) : "-"}</span>
                        </div>
                        <div className="d-flex align-items-center" title={ts("studentEnjoyment")}>
                          <Smile size={16} className="me-1" style={{ color: '#198754' }} aria-label={ts("studentEnjoyment")} role="img" />
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
                                      {ts("healthSummary")}
                                  </h6>
                                  <button 
                                    className="btn btn-sm d-flex align-items-center shadow-sm"
                                    onClick={(e) => { e.stopPropagation(); handleExportPDF(session); }}
                                    style={{ background: '#1D153A', color: 'white', borderRadius: '1rem', padding: '0.4rem 1rem' }}
                                  >
                                    <Download size={14} className="me-2" style={{ color: '#00d4ff' }} aria-hidden="true" /> {ts("exportPdf")}
                                  </button>
                                </div>
                                <div className="card border-0 shadow-sm rounded-4 p-3 d-flex flex-row flex-wrap gap-4 align-items-center" style={{ background: 'rgba(29, 21, 58, 0.03)' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>{ts("teacherEvaluation")}</span>
                                        <div className="badge rounded-pill px-3 py-2 d-flex align-items-center" style={{ background: 'white', color: '#1D153A', border: '1px solid rgba(229, 184, 105, 0.5)' }}>
                                            <Star size={14} className="me-1" fill="#e5b869" color="#e5b869" /> 
                                            {session.teacherRating ? `${session.teacherRating.toFixed(1)}/5` : "N/A"}
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>{ts("objective")}</span>
                                        {OBJECTIVE_BADGE[session.objectiveLevel] ? (
                                            <span className="badge rounded-pill px-3 py-2" style={OBJECTIVE_BADGE[session.objectiveLevel]}>
                                                <Target size={14} className="me-1"/> {t(`teacher.objectiveOptions.${session.objectiveLevel as 0 | 1 | 2}`)}
                                            </span>
                                        ) : (
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2">N/A</span>
                                        )}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small fw-bold" style={{ color: '#4a4266' }}>{ts("studentEnjoymentLabel")}</span>
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
                                {ts("contentAlert")}
                              </h6>
                              <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2) !important' }}>
                                {session.hardestQuestion ? (
                                    <>
                                        <div className="d-flex align-items-center mb-2">
                                            <span className="badge rounded-pill me-2" style={{ background: '#dc3545', color: 'white' }}>{ts("hardest")}</span>
                                            <span className="small fw-bold" style={{ color: '#dc3545' }}>{ts("missRate", { rate: session.hardestQuestion.error })}</span>
                                        </div>
                                        <p className="mb-0 fw-bold" style={{ color: '#1D153A' }}>&ldquo;{session.hardestQuestion.texto}&rdquo;</p>
                                        <p className="small text-muted mt-2 mb-0">{ts("reinforce")}</p>
                                    </>
                                ) : (
                                    <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
                                        <p className="mb-0 small" style={{ color: '#4a4266' }}>{ts("notEnoughData")}</p>
                                    </div>
                                )}
                              </div>
                            </div>

                            {/* Student List */}
                            <div className="col-12 col-md-8">
                              <h6 className="fw-bold mb-3 text-uppercase small" style={{ color: '#1D153A' }}>
                                <Smile size={16} className="me-2" style={{ color: '#198754' }} /> 
                                {ts("participants", { count: session.LUDI_SESION_PARTICIPANTE?.length || 0 })}
                              </h6>
                              <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid rgba(29,21,58,0.05)' }}>
                                <table className="table table-hover mb-0 align-middle">
                                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#E8E5F7' }}>
                                    <tr>
                                      <th className="ps-3 border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>{ts("student")}</th>
                                      <th className="text-center border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>{ts("score")}</th>
                                      <th className="text-center pe-3 border-0 py-2 small text-uppercase" style={{ color: '#4a4266' }}>{ts("reception")}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {session.LUDI_SESION_PARTICIPANTE && session.LUDI_SESION_PARTICIPANTE.length > 0 ? (
                                      session.LUDI_SESION_PARTICIPANTE.map((p: any) => (
                                        <tr key={p.id.toString()} style={{ borderBottom: '1px solid rgba(29,21,58,0.05)' }}>
                                          <td className="ps-3 py-2 d-flex align-items-center border-0">
                                            {p.avatar ? (
                                              <img src={p.avatar.urlImagen} alt="" className="rounded-circle me-2 object-fit-cover shadow-sm" style={{ width: '28px', height: '28px' }} />
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
                                                  p.studentEnjoyment >= 4 ? <span title={ts("receptionHigh")} role="img" aria-label={ts("receptionHigh")}>💚</span> :
                                                  p.studentEnjoyment >= 3 ? <span title={ts("receptionMid")} role="img" aria-label={ts("receptionMid")}>💛</span> :
                                                  <span title={ts("receptionLow")} role="img" aria-label={ts("receptionLow")}>❤️</span>
                                              ) : (
                                                  <span className="text-muted small">-</span>
                                              )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={3} className="text-center py-4 small" style={{ color: '#4a4266' }}>{ts("noParticipants")}</td>
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
                <td colSpan={7} className="text-center py-5" style={{ color: '#4a4266' }}>{ts("noSessions")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}