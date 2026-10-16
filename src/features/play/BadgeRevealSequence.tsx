"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { findBadge, type BadgeDef } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import styles from "./BadgeRevealSequence.module.css";
import { useTranslations } from "next-intl";

// Tiempos de cada caja: se sacude, se abre y la insignia queda a la vista antes de la siguiente.
const SHAKE_MS = 1300;
const SHOW_MS = 2300;
const REDUCED_SHAKE_MS = 250;

interface BadgeRevealSequenceProps {
  /** Códigos de insignias ganadas durante la partida (en el orden en que se ganaron). */
  codes: string[];
  /** Narración opcional (voz) al salir cada insignia. */
  onReveal?: (text: string) => void;
  /** Al terminar de mostrar la última. */
  onComplete: () => void;
}

/**
 * Las insignias ganadas salen de una caja sorpresa, una tras otra y solas: la caja se
 * sacude, se abre y aparece la insignia. No hay botones que leer; tocar adelanta.
 */
export const BadgeRevealSequence = ({ codes, onReveal, onComplete }: BadgeRevealSequenceProps) => {
  const catalog = useAchievementCatalog();
  const achievementText = useAchievementText();
  const t = useTranslations("Play.achievements");
  const badges = useMemo(
    () => codes.map((code) => findBadge(catalog, code)).filter((b): b is BadgeDef => Boolean(b)),
    [catalog, codes],
  );
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const reduceMotion = typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const advance = useCallback(() => {
    if (!opened) return setOpened(true);
    if (index >= badges.length - 1) return onComplete();
    setOpened(false);
    setIndex((i) => i + 1);
  }, [opened, index, badges.length, onComplete]);

  // Sin insignias que mostrar no hay caja: se pasa directo al resumen.
  useEffect(() => {
    if (badges.length === 0) onComplete();
  }, [badges.length, onComplete]);

  useEffect(() => {
    if (badges.length === 0) return;
    const timer = window.setTimeout(advance, opened ? SHOW_MS : reduceMotion ? REDUCED_SHAKE_MS : SHAKE_MS);
    return () => window.clearTimeout(timer);
  }, [advance, opened, badges.length, reduceMotion]);

  const current = badges[index];
  useEffect(() => {
    if (!opened || !current) return;
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 }, disableForReducedMotion: true });
    onReveal?.(achievementText.badgeUnlocked(current));
    // Solo al abrir cada caja; el texto de la voz no debe volver a sonar al re-renderizar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, index]);

  if (!current) return null;
  const text = achievementText.badge(current);

  return (
    <button
      type="button"
      className={styles.stage}
      onClick={advance}
      aria-label={t("tapToContinue")}
      data-opened={opened || undefined}
    >
      <span className={styles.counter}>{t("revealCounter", { current: index + 1, total: badges.length })}</span>

      <span className={styles.scene} aria-hidden="true">
        {/* La key reinicia las animaciones de la caja en cada insignia. */}
        <span key={`box-${index}`} className={styles.box}>
          <span className={styles.lid}><span className={styles.bow} /></span>
          <span className={styles.body} />
        </span>
        {opened && (
          <span key={`badge-${index}`} className={styles.badge} style={{ borderColor: current.color }}>
            <BadgeArt badge={current} size={96} radius={18} />
          </span>
        )}
      </span>

      <span className={styles.caption} role="status">
        {opened ? (
          <>
            <strong className={styles.name} style={{ color: current.color }}>{text.name}</strong>
            <span className={styles.phrase}>{text.phrase}</span>
          </>
        ) : (
          <span className={styles.phrase}>{t("surprise")}</span>
        )}
      </span>
    </button>
  );
};
