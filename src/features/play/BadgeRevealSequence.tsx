"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { FaGift } from "react-icons/fa6";
import { findBadge, type Badge } from "@/features/gamification/achievementRules";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import styles from "./BadgeRevealSequence.module.css";

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

  const badges = codes
    .map((code) => findBadge(code))
    .filter((b): b is Badge => Boolean(b));

  if (badges.length === 0) return null;

  const current = badges[index];
  const isLast = index === badges.length - 1;

  const handleOpen = () => {
    setOpened(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    onReveal?.(`Insignia desbloqueada: ${current.name}. ${current.phrase}`);
  };

  const handleNext = () => {
    setOpened(false);
    setIndex((i) => i + 1);
  };

  return (
    <div className={styles.wrapper}>
      <h5 className={styles.title}>
        Insignias ganadas ({index + (opened ? 1 : 0)}/{badges.length})
      </h5>

      {!opened ? (
        <button
          className={styles.box}
          onClick={handleOpen}
          aria-label={`Abrir insignia sorpresa ${index + 1} de ${badges.length}`}
        >
          <span className={styles.boxEmoji} aria-hidden="true"><FaGift /></span>
          <span className={styles.boxLabel}>Toca para abrir</span>
        </button>
      ) : (
        <div className={styles.reveal} style={{ borderColor: current.color }}>
          <BadgeArt badge={current} size={72} radius={14} className={styles.revealImg} />
          <strong className={styles.revealName} style={{ color: current.color }}>{current.name}</strong>
          <span className={styles.revealPhrase}>{current.phrase}</span>
          {!isLast ? (
            <button className={styles.nextBtn} onClick={handleNext}>Siguiente insignia →</button>
          ) : (
            <span className={styles.doneLabel}>¡Todas tus insignias reveladas!</span>
          )}
        </div>
      )}
    </div>
  );
};
