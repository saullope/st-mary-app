"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StudentFeedbackForm } from "@/features/followUp/components/StudentFeedbackForm";
import followUpStyles from "@/features/followUp/components/followUp.module.css";
import type { Rating } from "@/features/followUp/followUp";
import { FaCircleCheck } from "react-icons/fa6";
import { findBadge, findMission, type BadgeDef, type MissionDef } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import { AchievementToast, type AchievementItem } from "./AchievementToast";
import { BadgeRevealSequence } from "./BadgeRevealSequence";
import revealStyles from "./BadgeRevealSequence.module.css";
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

interface EarnedAchievementsProps {
  missionCodes: string[];
  badgeCodes: string[];
}

/** Todas las insignias y misiones de la partida juntas, al final. */
const EarnedAchievements = ({ missionCodes, badgeCodes }: EarnedAchievementsProps) => {
  const catalog = useAchievementCatalog();
  const achievementText = useAchievementText();
  const t = useTranslations("Play.screens");
  const tAchievements = useTranslations("Play.achievements");
  const missions = missionCodes.map((code) => findMission(catalog, code)).filter((m): m is MissionDef => Boolean(m));
  const badges = badgeCodes.map((code) => findBadge(catalog, code)).filter((b): b is BadgeDef => Boolean(b));

  return (
    <>
      {badges.length > 0 && (
        <section className={revealStyles.earned} aria-labelledby="earned-badges-title">
          <h2 id="earned-badges-title" className={revealStyles.earnedTitle}>{tAchievements("yourBadges")}</h2>
          <ul className={revealStyles.earnedGrid}>
            {badges.map((badge, index) => {
              const text = achievementText.badge(badge);
              return (
                <li key={badge.code} className={revealStyles.earnedItem} style={{ borderColor: badge.color, animationDelay: `${index * 0.08}s` }}>
                  <BadgeArt badge={badge} size={64} radius={14} />
                  <strong className={revealStyles.earnedName} style={{ color: badge.color }}>{text.name}</strong>
                  <span className={revealStyles.earnedPhrase}>{text.phrase}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
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
    </>
  );
};

interface GameSummaryProps extends EarnedAchievementsProps {
  /** Encabezado del resumen: trofeo, título y puntaje de cada tipo de juego. */
  children: ReactNode;
  onReveal: (text: string) => void;
  sesion: any;
  participant: PlayParticipant | null;
  previewMode: boolean;
  onExit?: () => void;
}

/**
 * Final de cualquier juego. Si ganó insignias, primero salen de la caja sorpresa solas;
 * después se ve todo junto: puntaje, insignias, misiones, la encuesta y la salida.
 */
export const GameSummary = ({ children, missionCodes, badgeCodes, onReveal, sesion, participant, previewMode, onExit }: GameSummaryProps) => {
  const t = useTranslations("Play.achievements");
  const [revealing, setRevealing] = useState(badgeCodes.length > 0);
  // Estables entre renders: el motor arma las listas en cada render y eso reiniciaría la caja.
  const badgeKey = badgeCodes.join(",");
  const codes = useMemo(() => (badgeKey ? badgeKey.split(",") : []), [badgeKey]);
  const finishReveal = useCallback(() => setRevealing(false), []);

  if (revealing) {
    return (
      <>
        <h1 className={styles.summaryTitle}>{t("badgesWon", { count: codes.length })}</h1>
        <BadgeRevealSequence codes={codes} onReveal={onReveal} onComplete={finishReveal} />
      </>
    );
  }

  return (
    <>
      {children}
      <EarnedAchievements missionCodes={missionCodes} badgeCodes={codes} />
      <SummaryActions sesion={sesion} participant={participant} previewMode={previewMode} onExit={onExit} />
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
