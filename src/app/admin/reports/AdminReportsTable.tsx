"use client";

import { useState, type ReactNode } from "react";
import { Star, Smile, Eye } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFormatter, useTranslations } from "next-intl";
import tableStyles from "@/components/ui/DataTable.module.css";
import AdminSessionSummaryModal from "./AdminSessionSummaryModal";

interface AdminReportsTableProps {
  sessions: any[];
  /** Pagination, shown as the table container's footer. */
  footer?: ReactNode;
}

export default function AdminReportsTable({ sessions, footer }: AdminReportsTableProps) {
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const t = useTranslations("FollowUp");
  const ts = useTranslations("AdminSessions");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  const formatDate = (value: string | Date) => format.dateTime(new Date(value), { dateStyle: "medium" });
  const objectiveLabel = (level: number | null) =>
    level === 0 || level === 1 || level === 2 ? t(`teacher.objectiveOptions.${level}`) : ts("notAvailable");

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
    <div className={tableStyles.container}>
      <table className={`table table-hover align-middle ${tableStyles.table}`}>
        <thead>
          <tr>
            <th className="text-uppercase">{ts("teacher")}</th>
            <th className="text-uppercase">{ts("activity")}</th>
            <th className="text-uppercase">{ts("type")}</th>
            <th className="text-uppercase">{ts("grade")}</th>
            <th className="text-uppercase">{ts("date")}</th>
            <th className="text-center text-uppercase">{ts("scores")}</th>
            <th><span className="visually-hidden">{ts("actions")}</span></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const activityName = session.LUDI_ACTIVIDAD?.activity?.activity_name || ts("activity");
            const isTemplateCopy = session.LUDI_ACTIVIDAD?.plantillaOrigenId != null;
            return (
              <tr key={session.id.toString()} onClick={() => setSelectedSession(session)} style={{ cursor: "pointer" }}>
                <td>
                  <div className="fw-bold" style={{ color: '#1D153A' }}>{session.user?.nombre || ts("unknownUser")}</div>
                  <div style={{ color: '#4a4266', fontSize: 'var(--text-meta)' }}>{session.user?.email || ts("noEmail")}</div>
                </td>
                <td className="fw-bold">{activityName}</td>
                <td>
                  {/* temaId es el fondo visual; el origen real de la copia es plantillaOrigenId. */}
                  <span className="badge rounded-pill" style={{ background: isTemplateCopy ? 'rgba(106, 75, 255, 0.1)' : 'rgba(29, 21, 58, 0.1)', color: isTemplateCopy ? '#6a4bff' : '#1D153A' }}>
                    {t(isTemplateCopy ? "admin.typeTemplateCopy" : "admin.typeOwn")}
                  </span>
                </td>
                <td className="fw-medium" style={{ color: '#4a4266' }}>
                  {session.LUDI_ACTIVIDAD?.gradoId ? tCommon(`grades.${session.LUDI_ACTIVIDAD.gradoId as 1 | 2 | 3}`) : tCommon("noGrade")}
                </td>
                <td style={{ color: '#4a4266', fontSize: 'var(--text-meta)' }}>
                  {session.finalizada_en ? formatDate(session.finalizada_en) : ts("inProgress")}
                </td>
                <td className="text-center">
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
                <td className="text-end">
                  {/* The row click is for the mouse; this button is the keyboard and screen reader path. */}
                  <button
                    type="button"
                    className={tableStyles.rowButton}
                    onClick={(event) => { event.stopPropagation(); setSelectedSession(session); }}
                    aria-label={ts("viewSummaryOf", { name: activityName })}
                    title={ts("viewSummary")}
                  >
                    <Eye size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}

          {sessions.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center" style={{ color: '#4a4266' }}>{ts("noSessions")}</td>
            </tr>
          )}
        </tbody>
      </table>
      {footer && <div className={tableStyles.footer}>{footer}</div>}
      <AdminSessionSummaryModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onExportPdf={handleExportPDF}
      />
    </div>
  );
}