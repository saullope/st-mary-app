"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ActivityRatingModal } from "@/components/activity/ActivityRatingModal";
import { FaCircleCheck } from "react-icons/fa6";
import { findMission } from "@/features/gamification/achievementRules";
import { AchievementToast, type AchievementItem } from "./AchievementToast";
import { BadgeRevealSequence } from "./BadgeRevealSequence";
import styles from "./game.module.css";
import { postPlay, type PlayParticipant } from "./playApi";

interface PlayScreenProps {
  backgroundImage: string;
  achievementQueue?: AchievementItem[];
  children: ReactNode;
}

/** Fondo del tema con su capa oscura, común a todas las pantallas del juego. */
export const PlayScreen = ({ backgroundImage, achievementQueue, children }: PlayScreenProps) => (
  <div className={styles.gameWrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
    <div className={styles.overlay}></div>
    {achievementQueue && <AchievementToast queue={achievementQueue} />}
    {children}
  </div>
);

export const ReadyCard = ({ name, onStart }: { name?: string; onStart: () => void }) => (
  <div className={styles.centerCard}>
    <h1 className={styles.readyTitle}>¿Estás listo, {name}?</h1>
    <button className={styles.bigStartBtn} onClick={onStart}>
      ¡SÍ, VAMOS!
    </button>
  </div>
);

interface AchievementsRecapProps {
  missionCodes: string[];
  badgeCodes: string[];
  gradeId: number;
  onReveal: (text: string) => void;
}

/** Misiones cumplidas y caja sorpresa de insignias del resumen final. */
export const AchievementsRecap = ({ missionCodes, badgeCodes, gradeId, onReveal }: AchievementsRecapProps) => {
  const missions = missionCodes
    .map((code) => findMission(code, gradeId))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <>
      {missions.length > 0 && (
        <div className={styles.missionsRecap}>
          <h5 className={styles.missionsRecapTitle}>Misiones cumplidas</h5>
          <div className={styles.missionsChips}>
            {missions.map((m) => (
              <span key={m.id} className={styles.missionChip}><FaCircleCheck aria-hidden="true" /> {m.text}</span>
            ))}
          </div>
        </div>
      )}
      <BadgeRevealSequence codes={badgeCodes} onReveal={onReveal} />
    </>
  );
};

interface SummaryActionsProps {
  sesion: any;
  participant: PlayParticipant | null;
  previewMode: boolean;
  onExit?: () => void;
}

/** Valoración opcional del estudiante y botón de salida del resumen final. */
export const SummaryActions = ({ sesion, participant, previewMode, onExit }: SummaryActionsProps) => {
  const router = useRouter();
  const [hasRated, setHasRated] = useState(false);
  const showFeedback = sesion.user?.config?.enableStudentFeedback !== false;

  const handleRating = async (enjoyment: number, learning: number) => {
    setHasRated(true);
    if (previewMode || !participant) return;
    try {
      // rating conserva el promedio para el campo heredado.
      await postPlay("/api/play/feedback", participant, { rating: (enjoyment + learning) / 2, enjoyment, learning });
    } catch (err) {
      console.error("Failed to submit rating:", err);
    }
  };

  return (
    <>
      {showFeedback && !hasRated && (
        <div className="mt-4 mb-4">
          <ActivityRatingModal onRate={handleRating} />
        </div>
      )}
      {hasRated && (
        <p className="text-success bg-white bg-opacity-75 py-2 px-4 rounded-pill fw-bold shadow-sm my-4 d-inline-block">¡Gracias por tu retroalimentación!</p>
      )}
      <button className={styles.backBtn} onClick={() => (previewMode ? onExit?.() : router.push("/play"))}>
        {previewMode ? "Cerrar Vista Previa" : "Volver al inicio"}
      </button>
    </>
  );
};
