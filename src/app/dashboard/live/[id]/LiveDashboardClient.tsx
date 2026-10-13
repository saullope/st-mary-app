"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaCheck, FaCopy, FaPlay, FaFlagCheckered, FaChartColumn } from "react-icons/fa6";
import { PostGameFeedbackModal } from "@/components/activity/PostGameFeedbackModal";
import type { SessionPhase } from "@/lib/play/sessionState";
import styles from "./LivePanel.module.css";

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

const PHASE_LABELS: Record<SessionPhase, string> = {
  waiting: "Sala de espera",
  active: "En curso",
  finished: "Finalizada",
};

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

const Ranking = ({ participants }: { participants: Participant[] }) => (
  <ol className={styles.ranking}>
    {participants.map((p, index) => (
      <li key={p.id} className={styles.rankRow} data-top={index < 3}>
        <span className={styles.rank}>{index + 1}</span>
        <StudentAvatar participant={p} small />
        <span className={styles.rankName}>{p.nombre}</span>
        {p.completado && (
          <span className={styles.done}><FaCheck aria-hidden="true" /> Terminó</span>
        )}
        <span className={styles.points}>{p.puntaje_total} pts</span>
      </li>
    ))}
  </ol>
);

export default function LiveDashboardClient({ sessionId }: { sessionId: string }) {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

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

  // La valoración del docente se pide antes de cerrar; omitirla también termina la actividad.
  const finishWithFeedback = async (data?: { utilityRating: number; difficultyRating: number | null; objectiveMet: boolean | null }) => {
    setShowFeedbackModal(false);
    if (data) {
      try {
        await fetch("/api/play/teacher-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sesionId: sessionId,
            rating: data.utilityRating,
            difficultyRating: data.difficultyRating,
            objectiveMet: data.objectiveMet,
          }),
        });
      } catch (error) {
        console.error("Error sending teacher feedback:", error);
      }
    }
    updateSession("end");
  };

  if (loading && !session) return <div className={styles.state} role="status">Cargando panel en vivo...</div>;
  if (!session) return <div className={styles.state} role="alert">No se pudo cargar la sesión.</div>;

  const participants = session.participantes;
  const completed = participants.filter((p) => p.completado).length;
  const progress = participants.length ? Math.round((completed / participants.length) * 100) : 0;
  const joinHost = typeof window !== "undefined" ? `${window.location.host}/play` : "/play";

  return (
    <div className={styles.page}>
      <Link href="/dashboard/my-activities" className={styles.backLink}>
        <FaArrowLeft aria-hidden="true" /> Mis actividades
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel en vivo</h1>
          <p className={styles.subtitle}>
            {session.phase === "waiting" && "Comparte el PIN. La actividad comenzará para todos cuando la inicies."}
            {session.phase === "active" && "Sigue el avance de tus estudiantes en tiempo real."}
            {session.phase === "finished" && "Estos son los resultados finales de la sesión."}
          </p>
        </div>
        <span className={styles.status}>
          <span className={styles.statusDot} data-phase={session.phase} aria-hidden="true" />
          {PHASE_LABELS[session.phase]}
        </span>
      </header>

      {session.phase === "waiting" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="students-title">
            <h2 id="students-title" className={styles.panelTitle}>
              Estudiantes conectados <span className={styles.count}>{participants.length}</span>
            </h2>
            {participants.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.muted}>Aún no se ha unido nadie. Los estudiantes aparecerán aquí al ingresar el PIN.</p>
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

          <aside className={styles.panel} aria-label="PIN y controles">
            <p className={styles.pinLabel}>PIN de la actividad</p>
            <div className={styles.pinRow}>
              <span className={styles.pin}>{session.codigo}</span>
              <button type="button" className={styles.iconButton} onClick={copyPin} aria-label={copied ? "PIN copiado" : "Copiar PIN"} title="Copiar PIN">
                {copied ? <FaCheck aria-hidden="true" /> : <FaCopy aria-hidden="true" />}
              </button>
            </div>
            <p className={styles.joinHint}>Los estudiantes entran en <strong>{joinHost}</strong></p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => updateSession("start")}
                disabled={participants.length === 0}
              >
                <FaPlay aria-hidden="true" /> Iniciar actividad
              </button>
              {participants.length === 0 && (
                <p className={styles.muted}>Podrás iniciar cuando se una al menos un estudiante.</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {session.phase === "active" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="ranking-title">
            <h2 id="ranking-title" className={styles.panelTitle}>
              Posiciones <span className={styles.count}>{participants.length} estudiantes</span>
            </h2>
            {participants.length === 0 ? (
              <p className={styles.muted}>No hay estudiantes conectados.</p>
            ) : (
              <Ranking participants={participants} />
            )}
          </section>

          <aside className={styles.panel} aria-label="Avance y controles">
            <h2 className={styles.panelTitle}>Avance de la clase</h2>
            <p className={styles.progressValue}>{completed} de {participants.length}</p>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Estudiantes que terminaron"
            >
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={`${styles.muted} mt-2`}>Estudiantes que terminaron la actividad.</p>

            <div className={styles.actions}>
              <button type="button" className={styles.dangerButton} onClick={() => setShowFeedbackModal(true)}>
                <FaFlagCheckered aria-hidden="true" /> Terminar actividad
              </button>
            </div>
          </aside>
        </div>
      )}

      {session.phase === "finished" && (
        <div className={styles.grid}>
          <section className={styles.panel} aria-labelledby="results-title">
            <h2 id="results-title" className={styles.panelTitle}>
              Resultados <span className={styles.count}>{participants.length} estudiantes</span>
            </h2>
            {participants.length === 0 ? (
              <p className={styles.muted}>Nadie participó en esta sesión.</p>
            ) : (
              <Ranking participants={participants} />
            )}
          </section>

          <aside className={styles.panel} aria-label="Siguientes pasos">
            <h2 className={styles.panelTitle}>Sesión finalizada</h2>
            <p className={styles.muted}>Revisa el detalle por estudiante y califica las respuestas escritas en el reporte.</p>
            <div className={styles.actions}>
              <Link href={`/dashboard/reports/${session.id}`} className={styles.primaryButton}>
                <FaChartColumn aria-hidden="true" /> Ver reporte
              </Link>
              <Link href="/dashboard/my-activities" className={styles.secondaryButton}>
                Volver a mis actividades
              </Link>
            </div>
          </aside>
        </div>
      )}

      {showFeedbackModal && (
        <PostGameFeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => finishWithFeedback()}
          onSubmit={finishWithFeedback}
          isTemplate={false}
        />
      )}
    </div>
  );
}
