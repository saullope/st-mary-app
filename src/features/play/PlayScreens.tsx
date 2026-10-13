"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StudentFeedbackForm } from "@/features/followUp/components/StudentFeedbackForm";
import followUpStyles from "@/features/followUp/components/followUp.module.css";
import type { Rating } from "@/features/followUp/followUp";
import { FaCircleCheck } from "react-icons/fa6";
import { findMission, type MissionDef } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
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

export const ReadyCard = ({ name, onStart }: { name?: string; onStart: () => void }) => {
  const t = useTranslations("Play.screens");
  return (
    <div className={styles.centerCard}>
      <h1 className={styles.readyTitle}>{name ? t("readyName", { name }) : t("ready")}</h1>
      <button type="button" className={styles.bigStartBtn} onClick={onStart}>
        {t("start")}
      </button>
    </div>
  );
};

interface AchievementsRecapProps {
  missionCodes: string[];
  badgeCodes: string[];
  onReveal: (text: string) => void;
}

/** Misiones cumplidas y caja sorpresa de insignias del resumen final. */
export const AchievementsRecap = ({ missionCodes, badgeCodes, onReveal }: AchievementsRecapProps) => {
  const catalog = useAchievementCatalog();
  const achievementText = useAchievementText();
  const t = useTranslations("Play.screens");
  const missions = missionCodes
    .map((code) => findMission(catalog, code))
    .filter((m): m is MissionDef => Boolean(m));

  return (
    <>
      {missions.length > 0 && (
        <div className={styles.missionsRecap}>
          <h5 className={styles.missionsRecapTitle}>{t("missionsDone")}</h5>
          <div className={styles.missionsChips}>
            {missions.map((m) => (
              <span key={m.code} className={styles.missionChip}><FaCircleCheck aria-hidden="true" /> {achievementText.mission(m).text}</span>
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
  const t = useTranslations("Play.screens");
  const tFeedback = useTranslations("FollowUp.student");
  const [feedback, setFeedback] = useState<"asking" | "sent" | "skipped">("asking");
  // En vista previa no hay participante real; además el docente puede desactivarla.
  const askFeedback = !previewMode && Boolean(participant) && sesion.user?.config?.enableStudentFeedback !== false;

  const sendFeedback = async (enjoyment: Rating, learning: Rating) => {
    if (!participant) return false;
    try {
      const response = await postPlay("/api/play/feedback", participant, { enjoyment, learning });
      if (!response.ok) return false;
      setFeedback("sent");
      return true;
    } catch (err) {
      console.error("Failed to submit rating:", err);
      return false;
    }
  };

  return (
    <>
      {askFeedback && feedback === "asking" && (
        <StudentFeedbackForm onSubmit={sendFeedback} onSkip={() => setFeedback("skipped")} />
      )}
      {feedback === "sent" && (
        <p className={followUpStyles.thanks} role="status">{tFeedback("thanks")}</p>
      )}
      <button className={styles.backBtn} onClick={() => (previewMode ? onExit?.() : router.push("/play"))}>
        {previewMode ? t("closePreview") : t("backHome")}
      </button>
    </>
  );
};
