"use client";

import { Modal } from "react-bootstrap";
import { Star, Smile, AlertCircle, BookOpen, Target, Download } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { OBJECTIVE_LEVELS } from "@/features/followUp/followUp";

const OBJECTIVE_BADGE: Record<number, { background: string; color: string }> = {
  [OBJECTIVE_LEVELS.yes]: { background: 'rgba(25, 135, 84, 0.1)', color: '#198754' },
  [OBJECTIVE_LEVELS.partial]: { background: 'rgba(229, 184, 105, 0.2)', color: '#8a5a00' },
  [OBJECTIVE_LEVELS.no]: { background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' },
};

interface AdminSessionSummaryModalProps {
  /** Session to summarize; the modal is closed when null. */
  session: any | null;
  onClose: () => void;
  onExportPdf: (session: any) => void;
}

/** Summary of one played session: teacher evaluation, hardest question and participants. */
export default function AdminSessionSummaryModal({ session, onClose, onExportPdf }: AdminSessionSummaryModalProps) {
  const t = useTranslations("FollowUp");
  const ts = useTranslations("AdminSessions");
  const tCommon = useTranslations("Common");
  const format = useFormatter();

  const activityName = session?.LUDI_ACTIVIDAD?.activity?.activity_name || ts("activity");
  const gradeId = session?.LUDI_ACTIVIDAD?.gradoId as 1 | 2 | 3 | null | undefined;

  return (
    <Modal show={session !== null} onHide={onClose} size="lg" centered scrollable aria-labelledby="session-summary-title">
      {session && (
        <>
          <Modal.Header closeButton closeLabel={ts("close")} style={{ borderBottom: '1px solid #EFECF9' }}>
            <div>
              <Modal.Title id="session-summary-title" as="h2" className="fw-bold mb-1" style={{ color: '#1D153A', fontSize: 'var(--text-card)' }}>
                {activityName}
              </Modal.Title>
              <p className="mb-0" style={{ color: '#5E5878', fontSize: 'var(--text-meta)' }}>
                {session.user?.nombre || ts("unknownUser")}
                {" · "}
                {gradeId ? tCommon(`grades.${gradeId}`) : tCommon("noGrade")}
                {" · "}
                {session.finalizada_en ? format.dateTime(new Date(session.finalizada_en), { dateStyle: "medium" }) : ts("inProgress")}
              </p>
            </div>
          </Modal.Header>

          <Modal.Body style={{ fontSize: 'var(--text-base)' }}>
            <div className="row g-4">
              {/* Teacher evaluation */}
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <h3 className="fw-bold text-uppercase m-0 d-flex align-items-center" style={{ color: '#1D153A', fontSize: 'var(--text-meta)' }}>
                    <BookOpen size={16} className="me-2" style={{ color: '#6a4bff' }} aria-hidden="true" />
                    {ts("healthSummary")}
                  </h3>
                  <button
                    type="button"
                    className="btn btn-sm d-flex align-items-center"
                    onClick={() => onExportPdf(session)}
                    style={{ background: '#1D153A', color: 'white', borderRadius: '10px', height: '34px', fontSize: 'var(--text-ui)' }}
                  >
                    <Download size={14} className="me-2" style={{ color: '#00d4ff' }} aria-hidden="true" /> {ts("exportPdf")}
                  </button>
                </div>
                <div className="rounded-4 p-3 d-flex flex-row flex-wrap gap-4 align-items-center" style={{ background: 'rgba(29, 21, 58, 0.03)', border: '1px solid #EFECF9' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold" style={{ color: '#4a4266', fontSize: 'var(--text-meta)' }}>{ts("teacherEvaluation")}</span>
                    <span className="badge rounded-pill px-3 py-2 d-flex align-items-center" style={{ background: 'white', color: '#1D153A', border: '1px solid rgba(229, 184, 105, 0.5)', fontSize: 'var(--text-meta)' }}>
                      <Star size={14} className="me-1" fill="#e5b869" color="#e5b869" aria-hidden="true" />
                      {session.teacherRating ? `${session.teacherRating.toFixed(1)}/5` : ts("notAvailable")}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold" style={{ color: '#4a4266', fontSize: 'var(--text-meta)' }}>{ts("objective")}</span>
                    {OBJECTIVE_BADGE[session.objectiveLevel] ? (
                      <span className="badge rounded-pill px-3 py-2" style={{ ...OBJECTIVE_BADGE[session.objectiveLevel], fontSize: 'var(--text-meta)' }}>
                        <Target size={14} className="me-1" aria-hidden="true" /> {t(`teacher.objectiveOptions.${session.objectiveLevel as 0 | 1 | 2}`)}
                      </span>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2" style={{ fontSize: 'var(--text-meta)' }}>{ts("notAvailable")}</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold" style={{ color: '#4a4266', fontSize: 'var(--text-meta)' }}>{ts("studentEnjoymentLabel")}</span>
                    <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(106, 75, 255, 0.1)', color: '#6a4bff', fontSize: 'var(--text-meta)' }}>
                      <Smile size={14} className="me-1" aria-hidden="true" />
                      {session.avgStudentFun ? `${session.avgStudentFun.toFixed(1)}/5` : ts("notAvailable")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardest question */}
              <div className="col-12 col-md-5">
                <h3 className="fw-bold mb-3 text-uppercase d-flex align-items-center" style={{ color: '#1D153A', fontSize: 'var(--text-meta)' }}>
                  <AlertCircle size={16} className="me-2" style={{ color: '#dc3545' }} aria-hidden="true" />
                  {ts("contentAlert")}
                </h3>
                <div className="rounded-4 p-3" style={{ background: 'rgba(220, 53, 69, 0.05)', border: '1px solid rgba(220, 53, 69, 0.2)' }}>
                  {session.hardestQuestion ? (
                    <>
                      <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                        <span className="badge rounded-pill" style={{ background: '#dc3545', color: 'white', fontSize: 'var(--text-meta)' }}>{ts("hardest")}</span>
                        <span className="fw-bold" style={{ color: '#dc3545', fontSize: 'var(--text-meta)' }}>{ts("missRate", { rate: session.hardestQuestion.error })}</span>
                      </div>
                      <p className="mb-0 fw-bold" style={{ color: '#1D153A' }}>&ldquo;{session.hardestQuestion.texto}&rdquo;</p>
                      <p className="mt-2 mb-0" style={{ color: '#5E5878', fontSize: 'var(--text-meta)' }}>{ts("reinforce")}</p>
                    </>
                  ) : (
                    <p className="mb-0 text-center" style={{ color: '#4a4266', fontSize: 'var(--text-ui)' }}>{ts("notEnoughData")}</p>
                  )}
                </div>
              </div>

              {/* Participants */}
              <div className="col-12 col-md-7">
                <h3 className="fw-bold mb-3 text-uppercase d-flex align-items-center" style={{ color: '#1D153A', fontSize: 'var(--text-meta)' }}>
                  <Smile size={16} className="me-2" style={{ color: '#198754' }} aria-hidden="true" />
                  {ts("participants", { count: session.LUDI_SESION_PARTICIPANTE?.length || 0 })}
                </h3>
                <div className="rounded-4 overflow-auto" style={{ maxHeight: '260px', border: '1px solid #E4E0F5' }}>
                  <table className="table mb-0 align-middle" style={{ fontSize: 'var(--text-ui)' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="ps-3 py-2 text-uppercase" style={{ background: '#FAF9FF', color: '#5E5878', fontSize: 'var(--text-meta)' }}>{ts("student")}</th>
                        <th className="text-center py-2 text-uppercase" style={{ background: '#FAF9FF', color: '#5E5878', fontSize: 'var(--text-meta)' }}>{ts("score")}</th>
                        <th className="text-center pe-3 py-2 text-uppercase" style={{ background: '#FAF9FF', color: '#5E5878', fontSize: 'var(--text-meta)' }}>{ts("reception")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {session.LUDI_SESION_PARTICIPANTE && session.LUDI_SESION_PARTICIPANTE.length > 0 ? (
                        session.LUDI_SESION_PARTICIPANTE.map((p: any) => (
                          <tr key={p.id.toString()}>
                            <td className="ps-3 py-2">
                              <div className="d-flex align-items-center">
                                {p.avatar ? (
                                  <img src={p.avatar.urlImagen} alt="" className="rounded-circle me-2 object-fit-cover" style={{ width: '28px', height: '28px' }} />
                                ) : (
                                  <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: 'var(--text-meta)' }} aria-hidden="true">
                                    {p.nombre.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="fw-bold" style={{ color: '#1D153A' }}>{p.nombre}</span>
                              </div>
                            </td>
                            <td className="text-center py-2 fw-bold" style={{ color: '#1D153A' }}>{p.puntaje_total}</td>
                            <td className="text-center py-2">
                              {p.studentEnjoyment ? (
                                p.studentEnjoyment >= 4 ? <span title={ts("receptionHigh")} role="img" aria-label={ts("receptionHigh")}>💚</span> :
                                p.studentEnjoyment >= 3 ? <span title={ts("receptionMid")} role="img" aria-label={ts("receptionMid")}>💛</span> :
                                <span title={ts("receptionLow")} role="img" aria-label={ts("receptionLow")}>❤️</span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4" style={{ color: '#4a4266' }}>{ts("noParticipants")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}
