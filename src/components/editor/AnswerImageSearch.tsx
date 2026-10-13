"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FaSearch, FaImages } from "react-icons/fa";
import { SiPixabay } from "react-icons/si";
import quizStyles from "@/styles/pages/ludiquiz.module.css";
import styles from "./AnswerImageSearch.module.css";
import { useTranslations } from "next-intl";

export type ImageSearchSource = "unsplash" | "pixabay";

interface AnswerImageSearchProps {
  answerNumber: number;
  onPick: (source: ImageSearchSource) => void;
}

/** Botón de lupa de una respuesta: despliega las fuentes de imágenes disponibles. */
export const AnswerImageSearch = ({ answerNumber, onPick }: AnswerImageSearchProps) => {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const t = useTranslations("Editor.answers");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const pick = (source: ImageSearchSource) => {
    setOpen(false);
    onPick(source);
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={quizStyles["answer-action-btn"]}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("searchImageFor", { number: answerNumber })}
        title={t("searchImage")}
      >
        <FaSearch aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} className={styles.menu} role="menu">
          <button type="button" role="menuitem" className={styles.item} onClick={() => pick("unsplash")}>
            <FaImages aria-hidden="true" style={{ color: "#0096b4" }} /> Unsplash
          </button>
          <button type="button" role="menuitem" className={styles.item} onClick={() => pick("pixabay")}>
            <SiPixabay aria-hidden="true" style={{ color: "#1f9b55" }} /> Pixabay
          </button>
        </div>
      )}
    </div>
  );
};
