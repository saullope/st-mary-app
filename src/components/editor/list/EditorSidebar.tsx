"use client";

import type { ReactNode } from "react";
import styles from "./EditorList.module.css";

interface EditorSidebarProps {
  title: string;
  count: number;
  /** Debajo del título: botones para agregar elementos. */
  actions?: ReactNode;
  /** Al pie de la columna: confirmar o cancelar la edición en curso. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Columna izquierda común a todos los editores de /create. */
export const EditorSidebar = ({ title, count, actions, footer, children }: EditorSidebarProps) => (
  <aside className={`col-2 card p-3 me-3 ${styles.sidebar}`} aria-label={title} data-tour="editor-sidebar">
    <h5 className={styles.sidebarTitle}>{title} ({count})</h5>
    {actions}
    {children}
    {footer && <div className={styles.sidebarFooter}>{footer}</div>}
  </aside>
);
