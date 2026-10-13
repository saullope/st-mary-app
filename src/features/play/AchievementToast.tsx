"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import styles from "./AchievementToast.module.css";
import { useTranslations } from "next-intl";

export interface AchievementItem {
  /** Identifica de forma única cada aparición, para que React no reutilice el nodo entre logros distintos */
  key: string;
  kind: "badge" | "mission";
  title: string;
  description: string;
  img?: string;
  color?: string;
}

interface AchievementToastProps {
  /** Cola de logros nuevos, en orden. El componente los muestra uno a la vez y avanza solo. */
  queue: AchievementItem[];
}

/**
 * Muestra insignias/misiones ganadas durante el juego, una a la vez, con un
 * mini-confetti para reforzar el momento. GameEngine solo agrega al final
 * de `queue` - este componente decide cuándo mostrar el siguiente.
 */
export const AchievementToast = ({ queue }: AchievementToastProps) => {
  const t = useTranslations("Play.achievements");
  const [index, setIndex] = useState(0);
  const current = index < queue.length ? queue[index] : null;

  useEffect(() => {
    if (!current) return;

    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.25 },
      colors: current.color ? [current.color, "#FFD700", "#ffffff"] : undefined,
    });

    const timer = setTimeout(() => setIndex((i) => i + 1), 4000);
    return () => clearTimeout(timer);
  }, [current]);

  if (!current) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      {current.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current.img} alt="" className={styles.img} />
      )}
      <div className={styles.textGroup}>
        <span className={styles.kind}>
          {current.kind === "badge" ? t("badgeUnlocked") : t("missionDone")}
        </span>
        <span className={styles.title}>{current.title}</span>
        <span className={styles.description}>{current.description}</span>
      </div>
    </div>
  );
};
