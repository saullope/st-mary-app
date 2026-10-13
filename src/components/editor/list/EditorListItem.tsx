"use client";

import type { ReactNode } from "react";
import { FaArrowUp, FaArrowDown, FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import styles from "./EditorList.module.css";

export type EditorListTagTone = "violet" | "cyan" | "success" | "danger";

const TAG_CLASS: Record<EditorListTagTone, string> = {
  violet: styles.tagViolet,
  cyan: styles.tagCyan,
  success: styles.tagSuccess,
  danger: styles.tagDanger,
};

interface EditorListItemProps {
  /** Posición visible (1, 2, 3...). */
  position: number;
  label: string;
  /** Texto a mostrar cuando label está vacío. */
  placeholder: string;
  /** Miniatura o ícono del contenido. */
  leading: ReactNode;
  /** Sustantivo para las etiquetas accesibles: "pregunta", "diapositiva", "bloque". */
  itemName: string;
  selected: boolean;
  tag?: { text: string; tone: EditorListTagTone };
  warning?: string;
  /** Borrador que aún no forma parte de la lista: sin acciones de orden ni eliminación. */
  draft?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onSelect?: () => void;
  onMove?: (direction: -1 | 1) => void;
  onDelete?: () => void;
}

/** Elemento de la lista lateral, idéntico en todos los editores. */
export const EditorListItem = ({
  position,
  label,
  placeholder,
  leading,
  itemName,
  selected,
  tag,
  warning,
  draft = false,
  isFirst = false,
  isLast = false,
  onSelect,
  onMove,
  onDelete,
}: EditorListItemProps) => {
  const text = label.trim();
  const hasActions = !draft && (onMove || onDelete);

  return (
    <li className={`${styles.item} ${draft ? styles.itemDraft : ""}`} aria-current={selected ? "true" : undefined}>
      <button type="button" className={styles.select} onClick={onSelect} disabled={!onSelect}>
        <span className={styles.number}>{position}</span>
        <span className={styles.leading}>{leading}</span>
        <span className={`${styles.label} ${text ? "" : styles.labelMuted}`}>{text || placeholder}</span>
        {tag && <span className={`${styles.tag} ${TAG_CLASS[tag.tone]}`}>{tag.text}</span>}
        {warning && <FaTriangleExclamation className={styles.warning} role="img" aria-label={warning} />}
      </button>

      {hasActions && (
        <div className={styles.actions}>
          {onMove && (
            <>
              <button type="button" onClick={() => onMove(-1)} disabled={isFirst} aria-label={`Subir ${itemName} ${position}`} title="Subir">
                <FaArrowUp aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onMove(1)} disabled={isLast} aria-label={`Bajar ${itemName} ${position}`} title="Bajar">
                <FaArrowDown aria-hidden="true" />
              </button>
            </>
          )}
          {onDelete && (
            <button type="button" className={styles.deleteAction} onClick={onDelete} aria-label={`Eliminar ${itemName} ${position}`} title="Eliminar">
              <FaTrash aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </li>
  );
};

export const EditorList = ({ children, label }: { children: ReactNode; label: string }) => (
  <ol className={styles.list} aria-label={label}>{children}</ol>
);

export const EditorListEmpty = ({ children }: { children: ReactNode }) => (
  <p className={styles.emptyHint}>{children}</p>
);
