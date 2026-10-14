"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import { FaGrip, FaList } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import styles from "./ActivityCollection.module.css";

type ViewMode = "list" | "grid";

interface ActivityCollectionProps {
  /** localStorage key that remembers the chosen view for this page. */
  storageKey: string;
  /** Search and filter controls, shown in the same row as the view toggle. */
  filters?: ReactNode;
  /** Pagination; in list view it becomes the footer of the list container. */
  footer?: ReactNode;
  /** Shown instead of the items when there are none (filters stay visible). */
  emptyState?: ReactNode;
  children: ReactNode;
}

function readViewMode(key: string): ViewMode | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === "list" || value === "grid" ? value : null;
  } catch {
    return null;
  }
}

function saveViewMode(key: string, mode: ViewMode) {
  try {
    window.localStorage.setItem(key, mode);
  } catch {
    // Private mode or blocked storage: the choice just isn't remembered.
  }
}

/** Activities or templates shown as a compact list or a grid, with a toggle to switch. */
export default function ActivityCollection({ storageKey, filters, footer, emptyState, children }: ActivityCollectionProps) {
  const t = useTranslations("Collection");
  const [mode, setMode] = useState<ViewMode>("list");

  // Read after mount so the server render and the first client render match.
  useEffect(() => {
    const saved = readViewMode(storageKey);
    if (saved) setMode(saved);
  }, [storageKey]);

  const choose = (next: ViewMode) => {
    setMode(next);
    saveViewMode(storageKey, next);
  };

  const options: Array<{ value: ViewMode; label: string; icon: ReactNode }> = [
    { value: "list", label: t("list"), icon: <FaList aria-hidden="true" /> },
    { value: "grid", label: t("grid"), icon: <FaGrip aria-hidden="true" /> },
  ];

  const isEmpty = Children.count(children) === 0;

  return (
    <div>
      <div className={styles.toolbar}>
        {filters}
        <div className={styles.toggle} role="group" aria-label={t("view")}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={styles.toggleButton}
              aria-pressed={mode === option.value}
              onClick={() => choose(option.value)}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        emptyState
      ) : mode === "list" ? (
        // data-view lets item styles from other modules adapt to the layout.
        <div className={styles.list} data-view="list">
          <div className={styles.rows}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      ) : (
        <>
          <div className={styles.grid} data-view="grid">{children}</div>
          {footer && <div className={`${styles.list} ${styles.footer}`}>{footer}</div>}
        </>
      )}
    </div>
  );
}
