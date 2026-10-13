"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { FaGift } from "react-icons/fa6";
import { findBadge, type BadgeDef } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import styles from "./BadgeRevealSequence.module.css";
import { useTranslations } from "next-intl";

interface BadgeRevealSequenceProps {
  /** Códigos de insignias ganadas durante la partida (en el orden en que se ganaron) */
  codes: string[];
  /** Narración opcional (voz) al abrir cada caja */
  onReveal?: (text: string) => void;
}

/**
 * Muestra las insignias ganadas como cajas sorpresa, una a la vez: el
 * participante debe tocar la caja para abrirla y ver cuál ganó, luego pasa
 * a la siguiente. A diferencia de las misiones (que se muestran en vivo
 * durante el juego), las insignias solo se revelan aquí, al final.
 */
export const BadgeRevealSequence = ({ codes, onReveal }: BadgeRevealSequenceProps) => {
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);

  const catalog = useAchievementCatalog();
  const achievementText = useAchievementText();
  const t = useTranslations("Play.achievements");
  const badges = codes
    .map((code) => findBadge(catalog, code))
    .filter((b): b is BadgeDef => Boolean(b));

  if (badges.length === 0) return null;

  const current = badges[index];
  const currentText = achievementText.badge(current);
  const isLast = index === badges.length - 1;

  const handleOpen = () => {
    setOpened(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    onReveal?.(achievementText.badgeUnlocked(current));
  };

  const handleNext = () => {
    setOpened(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className={styles.wrapper}>
      <h5 className={styles.title}>
        {t("badgesEarned", { opened: index + (opened ? 1 : 0), total: badges.length })}
      </h5>

      {!opened ? (
        <button
          type="button"
          className={styles.box}
          onClick={handleOpen}
          aria-label={t("openBox", { number: index + 1, total: badges.length })}
        >
          <span className={styles.boxEmoji} aria-hidden="true"><FaGift /></span>
          <span className={styles.boxLabel}>{t("tapToOpen")}</span>
        </button>
      ) : (
        <div className={styles.reveal} style={{ borderColor: current.color }}>
          <BadgeArt badge={current} size={72} radius={14} className={styles.revealImg} />
          <strong className={styles.revealName} style={{ color: current.color }}>{currentText.name}</strong>
          <span className={styles.revealPhrase}>{currentText.phrase}</span>
          {!isLast ? (
            <button type="button" className={styles.nextBtn} onClick={handleNext}>{t("nextBadge")}</button>
          ) : (
            <span className={styles.doneLabel}>{t("allRevealed")}</span>
          )}
        </div>
      )}
    </div>
  );
};
