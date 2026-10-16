"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import confetti from "canvas-confetti";
import { FaTrophy, FaClone, FaRotate } from "react-icons/fa6";
import { notify } from "@/components/ui";
import { buildDeck, memoryScore, pairsFromSession, type MemoryCard } from "@/features/memory/memoryCards";
import { evaluateMemoryBadges, evaluateMemoryMissions, type MemoryProgressStats } from "@/features/gamification/achievementRules";
import { usePlaySession } from "./usePlaySession";
import { postPlay } from "./playApi";
import { PlayScreen, ReadyCard, GameSummary } from "./PlayScreens";
import styles from "./game.module.css";
import memoryStyles from "./memory.module.css";
import { useTranslations } from "next-intl";

interface MemoryEngineProps {
  sesion: any;
  previewMode?: boolean;
  onExit?: () => void;
  previewName?: string;
}

// Tiempo para ver las dos cartas antes de voltearlas de nuevo.
const MISS_REVEAL_MS = 900;

/** Reproductor de LudiMemory: tablero de parejas sin límite de tiempo. */
export const MemoryEngine = ({ sesion, previewMode = false, onExit, previewName }: MemoryEngineProps) => {
  const {
    config, participant, backgroundImage, selectedBadges, selectedMissions, speak,
    achievementQueue, awardedBadgesRef, awardedMissionsRef, recordBadges, announceMissions,
  } = usePlaySession({ sesion, previewMode, previewName });
  const t = useTranslations("Play.memory");

  const pairs = useMemo(() => pairsFromSession(sesion.LUDI_ACTIVIDAD.memoriaParejas), [sesion.LUDI_ACTIVIDAD.memoriaParejas]);
  const pointsPerPair: number = config.puntajeBase || 10;

  const [stage, setStage] = useState<"READY" | "PLAYING" | "SUBMITTING" | "SUMMARY">("READY");
  // El mazo se mezcla al empezar, no al renderizar, para no romper la hidratación.
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [status, setStatus] = useState("");
  const [score, setScore] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const start = () => {
    setDeck(buildDeck(pairs));
    setStage("PLAYING");
  };

  const finish = async (finalStats: MemoryProgressStats) => {
    setStage("SUBMITTING");
    let finalScore = memoryScore(pairs.length, pointsPerPair);

    if (!previewMode) {
      try {
        if (!participant) {
          notify.error(t("saveFailed"), t("sessionMissing"));
        } else {
          const response = await postPlay("/api/play/submit-memory", participant);
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error);
          finalScore = data.puntaje;
        }
      } catch (error) {
        console.error("Error submitting memory result:", error);
        notify.error(t("saveFailed"), t("tryAgain"));
      }
    }

    announceMissions(evaluateMemoryMissions(selectedMissions, awardedMissionsRef.current, finalStats));
    recordBadges(evaluateMemoryBadges(selectedBadges, awardedBadgesRef.current, finalStats));
    setScore(finalScore);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setStage("SUMMARY");
  };

  const flip = (card: MemoryCard) => {
    if (stage !== "PLAYING" || flipped.length === 2 || flipped.includes(card.key) || matched.has(card.pairId)) return;

    if (flipped.length === 0) {
      setFlipped([card.key]);
      return;
    }

    const first = deck.find((c) => c.key === flipped[0]);
    setAttempts((n) => n + 1);

    if (first?.pairId === card.pairId) {
      const nextMatched = new Set(matched).add(card.pairId);
      const stats: MemoryProgressStats = {
        totalPairs: pairs.length,
        pairsFound: nextMatched.size,
        misses,
        streak: streak + 1,
        isFinished: nextMatched.size === pairs.length,
      };
      setMatched(nextMatched);
      setFlipped([]);
      setStreak(stats.streak);
      setStatus(stats.isFinished ? t("allFound") : t("pairFound"));

      if (stats.isFinished) {
        finish(stats);
        return;
      }
      announceMissions(evaluateMemoryMissions(selectedMissions, awardedMissionsRef.current, stats));
      recordBadges(evaluateMemoryBadges(selectedBadges, awardedBadgesRef.current, stats));
      return;
    }

    setFlipped([flipped[0], card.key]);
    setMisses((n) => n + 1);
    setStreak(0);
    setStatus(t("notPair"));
    hideTimer.current = setTimeout(() => setFlipped([]), MISS_REVEAL_MS);
  };

  if (stage === "READY") {
    return (
      <PlayScreen backgroundImage={backgroundImage}>
        <ReadyCard name={participant?.name} onStart={start} />
      </PlayScreen>
    );
  }

  if (stage === "SUMMARY") {
    return (
      <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
        <div className={styles.centerCard}>
          <GameSummary
            missionCodes={Array.from(awardedMissionsRef.current)}
            badgeCodes={Array.from(awardedBadgesRef.current)}
            onReveal={speak}
            sesion={sesion}
            participant={participant}
            previewMode={previewMode}
            onExit={onExit}
          >
            <FaTrophy className={styles.trophyIcon} aria-hidden="true" />
            <h1 className={styles.summaryTitle}>{t("boardComplete")}</h1>
            <p className={styles.summaryScore}>{t.rich("score", { score, span: (chunks) => <span>{chunks}</span> })}</p>
            <p className={memoryStyles.summaryLine}>
              {t("summaryLine", { pairs: pairs.length, attempts })}
            </p>
          </GameSummary>
        </div>
      </PlayScreen>
    );
  }

  const columns = Math.min(6, Math.ceil(Math.sqrt(deck.length)));
  const rows = Math.ceil(deck.length / columns);

  return (
    <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
      <div className={styles.hud}>
        <div className={styles.hudItem}>
          <FaClone aria-hidden="true" /> {t("pairsProgress", { found: matched.size, total: pairs.length })}
        </div>
        <div className={styles.hudItem}>
          <FaRotate aria-hidden="true" /> {t("attempts", { count: attempts })}
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite">{status}</p>

      <div className={memoryStyles.boardArea}>
        <div
          className={memoryStyles.board}
          style={{ "--cols": columns, "--rows": rows } as CSSProperties}
        >
          {deck.map((card, index) => {
            const isMatched = matched.has(card.pairId);
            const isFaceUp = isMatched || flipped.includes(card.key);
            const state = isMatched ? t("cardMatched") : isFaceUp ? t("cardFaceUp") : t("cardFaceDown");
            return (
              <button
                key={card.key}
                type="button"
                className={memoryStyles.card}
                data-face-up={isFaceUp}
                data-matched={isMatched}
                onClick={() => flip(card)}
                disabled={isMatched || stage !== "PLAYING"}
                aria-label={t("cardLabel", { number: index + 1, state })}
              >
                <span className={memoryStyles.cardInner}>
                  <span className={`${memoryStyles.cardFace} ${memoryStyles.cardBack}`} aria-hidden="true" />
                  <span className={`${memoryStyles.cardFace} ${memoryStyles.cardFront}`} aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.imageUrl} alt="" draggable={false} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </PlayScreen>
  );
};
