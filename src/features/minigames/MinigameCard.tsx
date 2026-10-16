"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { FaLink, FaPlay } from "react-icons/fa6";
import { notify } from "@/components/ui";
import { subjectColor } from "@/features/subjects/subjectColors";
import { minigamePath, type Minigame } from "./minigames";
import styles from "./MinigameCard.module.css";

/** Tarjeta de la galería: jugar a pantalla completa o compartir el enlace con los estudiantes. */
export default function MinigameCard({ game }: { game: Minigame }) {
  const t = useTranslations("Minigames");
  const tCommon = useTranslations("Common");
  const tSubjects = useTranslations("Subjects");
  const title = t(`games.${game.slug}.title`);
  const path = minigamePath(game.slug);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      notify.success(t("linkCopied"), t("linkCopiedHint"));
    } catch {
      // Sin permiso de portapapeles se muestra el enlace para copiarlo a mano.
      notify.info(t("copyManually"), `${window.location.origin}${path}`);
    }
  };

  return (
    <article className={styles.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={game.cover} alt="" className={styles.cover} />
      <div className={styles.body}>
        <span className={styles.subject} style={{ "--chip": subjectColor(game.subject) } as CSSProperties}>
          {tSubjects.has(game.subject) ? tSubjects(game.subject) : game.subject} · {tCommon(`grades.${game.grade}`)}
        </span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{t(`games.${game.slug}.description`)}</p>
        <div className={styles.actions}>
          <a href={path} target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label={t("playOf", { name: title })}>
            <FaPlay aria-hidden="true" /> {t("play")}
          </a>
          <button type="button" className={styles.secondary} onClick={copyLink} aria-label={t("copyLinkOf", { name: title })}>
            <FaLink aria-hidden="true" /> {t("copyLink")}
          </button>
        </div>
      </div>
    </article>
  );
}
