"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./FirstActivityCard.module.css";

interface CardAction {
  label: string;
  onClick: () => void;
}

interface FirstActivityCardProps {
  title: string;
  text?: string;
  primary: CardAction;
  secondary: CardAction;
  /** Solo si la tarjeta aparece por algo que hizo el docente (p. ej. el cierre). */
  autoFocus?: boolean;
}

/** Tarjeta flotante en la esquina inferior derecha: no es un modal y no bloquea la página. */
export default function FirstActivityCard({ title, text, primary, secondary, autoFocus = false }: FirstActivityCardProps) {
  const id = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && autoFocus) cardRef.current?.focus({ preventScroll: true });
  }, [mounted, autoFocus]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={cardRef}
      className={styles.card}
      role="dialog"
      aria-labelledby={`${id}-title`}
      aria-describedby={text ? `${id}-text` : undefined}
      tabIndex={-1}
    >
      <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
      {text && <p id={`${id}-text`} className={styles.text}>{text}</p>}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={secondary.onClick}>
          {secondary.label}
        </button>
        <button type="button" className={styles.primary} onClick={primary.onClick}>
          {primary.label}
        </button>
      </div>
    </div>,
    document.body,
  );
}
