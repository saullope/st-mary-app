"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "react-bootstrap";
import { FaArrowLeft, FaCheck, FaCopy, FaPlay, FaFlagCheckered, FaChartColumn } from "react-icons/fa6";
import { TeacherEvaluationModal } from "@/features/followUp/components/TeacherEvaluationModal";
import { saveTeacherEvaluation } from "@/features/followUp/teacherEvaluationApi";
import type { TeacherEvaluation } from "@/features/followUp/followUp";
import type { SessionPhase } from "@/lib/play/sessionState";
import { useLeaveWarning } from "@/features/live/useLeaveWarning";
import styles from "./LivePanel.module.css";
import { useTranslations } from "next-intl";

interface Participant {
  id: string;
  nombre: string;
  puntaje_total: number;
  completado: boolean;
  avatar?: { nombre: string; urlImagen: string } | null;
}

interface SessionState {
  id: string;
  codigo: string;
  phase: SessionPhase;
  participantes: Participant[];
}

const POLL_MS = 2500;

const StudentAvatar = ({ participant, small = false }: { participant: Participant; small?: boolean }) => {
  const className = small ? styles.avatarSmall : styles.avatar;
  if (participant.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={participant.avatar.urlImagen} alt="" className={className} />;
  }
  return (
    <span className={`${className} ${styles.initial}`} aria-hidden="true">
      {participant.nombre.charAt(0).toUpperCase()}
    </span>
  );
};

const Ranking = ({ participants }: { participants: Participant[] }) => {
  const t = useTranslations("Live");
  return (
  <ol className={styles.ranking}>
    {participants.map((p, index) => (
      <li key={p.id} className={styles.rankRow} data-top={index < 3}>
        <span className={styles.rank}>{index + 1}</span>
        <StudentAvatar participant={p} small />
        <span className={styles.rankName}>{p.nombre}</span>
        {p.completado && (
          <span className={styles.done}><FaCheck aria-hidden="true" /> {t("done")}</span>
        )}
        <span className={styles.points}>{t("points", { score: p.puntaje_total })}</span>
      </li>
    ))}
  </ol>
  );
};

interface LiveDashboardClientProps {
  sessionId: string;
  gradeId: number | null;
  fromTemplate: boolean;
  /** Preferencia del docente (enableTeacherEvaluation). */
  askEvaluation: boolean;
}

export default function LiveDashboardClient({ sessionId, gradeId, fromTemplate, askEvaluation }: LiveDashboardClientProps) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  // Enlace al que el docente quiso ir con la sesión abierta; se confirma antes de salir.
  const [leaveTo, setLeaveTo] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("Live");

  // La sesión sigue abierta al salir (los estudiantes pueden seguir jugando): se avisa y se
  // explica cómo volver. Ya terminada no hay nada que perder.
  const sessionOpen = session !== null && session.phase !== "finished";
  useLeaveWarning(sessionOpen, setLeaveTo);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${sessionId}`, { cache: "no-store" });
      if (res.ok) setSession(await res.json());
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchSession]);

  const updateSession = async (action: "start" | "end") => {
    try {
      await fetch(`/api/live/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchSession();
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
    }
  };

  const copyPin = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.codigo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles el PIN sigue visible en pantalla.
    }
  };

  // La evaluación se pide antes de cerrar; omitirla también termina y el reporte la vuelve a ofrecer.
  const requestFinish = () => {
    if (askEvaluation) setShowFeedbackModal(true);
    else updateSession("end");
  };

  const finishWithEvaluation = async (evaluation: TeacherEvaluation) => {
    const saved = await saveTeacherEvaluation(sessionId, evaluation);
    if (!saved) return false;
    setShowFeedbackModal(false);
    updateSession("end");
    return true;
  };

  const finishWithoutEvaluation = () => {
    setShowFeedbackModal(false);
    updateSession("end");
  };

  const cancelFinish = useCallback(() => setShowFeedbackModal(false), []);

  if (loading && !session) return <div className={styles.state} role="status">{t("loading")}</div>;
  if (!session) return <div className={styles.state} role="alert">{t("loadError")}</div>;

  const participants = session.participantes;
  const completed = participants.filter((p) => p.completado).length;
  const progress = participants.length ? Math.round((completed / participants.length) * 100) : 0;
  const joinHost = typeof window !== "undefined" ? `${window.location.host}/play` : "/play";

  return (
    <div className={styles.page}>
      <Link href="/dashboard/my-activities" className={styles.backLink}>
        <FaArrowLeft aria-hidden="true" /> {t("myActivities")}
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {t(`subtitle.${session.phase}`)}
          </p>
        </div>
        <span className={styles.status}>
          <span className={styles.statusDot} data-phase={session.phase} aria-hidden="true" />
          {t(`phase.${session.phase}`)}
        </span>
      </header>

      {session.phase === "waiting" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="students-title">
            <h2 id="students-title" className={styles.panelTitle}>
              {t("connected")} <span className={styles.count}>{participants.length}</span>
            </h2>
            {participants.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.muted}>{t("nobodyYet")}</p>
              </div>
            ) : (
              <ul className={styles.students}>
                {participants.map((p) => (
                  <li key={p.id} className={styles.student}>
                    <StudentAvatar participant={p} />
                    <span className={styles.studentName}>{p.nombre}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className={styles.panel} aria-label={t("pinControls")}>
            <p className={styles.pinLabel}>{t("pinLabel")}</p>
            <div className={styles.pinRow}>
              <span className={styles.pin}>{session.codigo}</span>
              <button type="button" className={styles.iconButton} onClick={copyPin} aria-label={copied ? t("pinCopied") : t("copyPin")} title={t("copyPin")}>
                {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
              </button>
            </div>
            <p className={styles.joinHint}>{t.rich("joinHint", { host: joinHost, strong: (chunks) => <strong>{chunks}</strong> })}</p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => updateSession("start")}
                disabled={participants.length === 0}
              >
                <FaPlay aria-hidden="true" /> {t("start")}
              </button>
              {participants.length === 0 && (
                <p className={styles.muted}>{t("startHint")}</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {session.phase === "active" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="ranking-title">
            <h2 id="ranking-title" className={styles.panelTitle}>
              {t("ranking")} <span className={styles.count}>{t("students", { count: participants.length })}</span>
            </h2>
            {participants.length === 0 ? (
              <p className={styles.muted}>{t("noStudents")}</p>
            ) : (
              <Ranking participants={participants} />
            )}
          </section>

          <aside className={styles.panel} aria-label={t("progressControls")}>
            <h2 className={styles.panelTitle}>{t("progressTitle")}</h2>
            <p className={styles.progressValue}>{t("progressValue", { completed, total: participants.length })}</p>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("finishedStudents")}
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={`${styles.muted} mt-2`}>{t("finishedHint")}</p>

            <div className={styles.actions}>
              <button type="button" className={styles.dangerButton} onClick={requestFinish}>
                <FaFlagCheckered aria-hidden="true" /> {t("finish")}
              </button>
            </div>
          </aside>
        </div>
      )}

      {session.phase === "finished" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="results-title">
            <h2 id="results-title" className={styles.panelTitle}>
              {t("results")} <span className={styles.count}>{t("students", { count: participants.length })}</span>
            </h2>
            {participants.length === 0 ? (
              <p className={styles.muted}>{t("nobodyPlayed")}</p>
            ) : (
              <Ranking participants={participants} />
            )}
          </section>

          <aside className={styles.panel} aria-label={t("nextSteps")}>
            <h2 className={styles.panelTitle}>{t("finishedTitle")}</h2>
            <p className={styles.muted}>{t("finishedBody")}</p>
            <div className={styles.actions}>
              <Link href={`/dashboard/reports/${session.id}`} className={styles.primaryButton}>
                <FaChartColumn aria-hidden="true" /> {t("viewReport")}
              </Link>
              <Link href="/dashboard/my-activities" className={styles.secondaryButton}>
                {t("backToActivities")}
              </Link>
            </div>
          </aside>
        </div>
      )}

      <Modal show={leaveTo !== null} onHide={() => setLeaveTo(null)} centered aria-labelledby="leave-live-title">
        <Modal.Header closeButton closeLabel={t("leave.close")}>
          <Modal.Title id="leave-live-title" as="h2" className="fs-5">{t("leave.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">{t("leave.body", { count: session.participantes.length })}</p>
          <p className="mb-0 text-muted">{t("leave.howToReturn")}</p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className={styles.secondaryButton} onClick={() => setLeaveTo(null)}>
            {t("leave.stay")}
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              const target = leaveTo;
              setLeaveTo(null);
              if (target) router.push(target);
            }}
          >
            {t("leave.confirm")}
          </button>
        </Modal.Footer>
      </Modal>

      {showFeedbackModal && (
        <TeacherEvaluationModal
          gradeId={gradeId}
          fromTemplate={fromTemplate}
          onSubmit={finishWithEvaluation}
          onSkip={finishWithoutEvaluation}
          onCancel={cancelFinish}
        />
      )}
    </div>
  );
}
