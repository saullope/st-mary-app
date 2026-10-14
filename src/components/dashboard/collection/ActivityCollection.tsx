"use client";

import { useEffect, useState, type ReactNode } from "react";
import { FaGrip, FaList } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import styles from "./ActivityCollection.module.css";

type ViewMode = "list" | "grid";

interface ActivityCollectionProps {
  /** localStorage key that remembers the chosen view for this page. */
  storageKey: string;
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
export default function ActivityCollection({ storageKey, children }: ActivityCollectionProps) {
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

  return (
    <div>
      <div className={styles.toolbar}>
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
      {/* data-view lets item styles from other modules adapt to the layout. */}
      <div className={mode === "list" ? styles.list : styles.grid} data-view={mode}>
        {children}
      </div>
    </div>
  );
}
