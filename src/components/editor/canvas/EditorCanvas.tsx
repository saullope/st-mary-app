"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import GamificationPanel from "@/features/gamification/components/GamificationPanel/GamificationPanel";
import styles from "./EditorCanvas.module.css";

/** Lienzo central con el fondo del tema elegido; ocupa todo el ancho en pantalla completa. */
export const EditorCanvas = ({ title, children }: { title: string; children: ReactNode }) => {
  const { state } = useActivityEditor();
  return (
    <div
      className={`card shadow-sm d-flex ${state.fullScreen ? "col-12" : "col"} ${styles.canvas}`}
      style={{ backgroundImage: `url(${state.backgroundImage})` }}
      data-tour="editor-canvas"
    >
      <div className={styles.overlay} />
      <div className={`col d-flex flex-column align-items-center ${styles.content}`}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
    </div>
  );
};

interface EditorCardProps {
  icon: IconType;
  label: string;
  color: string;
  children: ReactNode;
}

/** Tarjeta del elemento seleccionado en el lienzo, encabezada por su tipo. */
export const EditorCard = ({ icon: Icon, label, color, children }: EditorCardProps) => (
  <div className={styles.card}>
    <span className={styles.cardKind} style={{ color }}>
      <Icon aria-hidden="true" /> {label}
    </span>
    {children}
  </div>
);

export const EditorPlaceholder = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className={styles.placeholder}>
    <h2>{title}</h2>
    <p>{children}</p>
  </div>
);

export const EditorNotice = ({ children }: { children: ReactNode }) => (
  <p className={styles.notice} role="alert">
    <FaTriangleExclamation aria-hidden="true" /> {children}
  </p>
);

/** Columna derecha con el Panel Lúdico integrado; se oculta en pantalla completa. */
export const EditorGamificationColumn = () => {
  const { state } = useActivityEditor();
  if (state.fullScreen) return null;
  return (
    <div className={`col-3 ms-3 ${styles.gamificationColumn}`}>
      <GamificationPanel />
    </div>
  );
};

export { styles as editorFieldStyles };
