"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./EditorList.module.css";

interface EditorAddButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type"> {
  icon: ReactNode;
  children: ReactNode;
}

/** Acción secundaria de la lista (agregar bloque, agregar diapositiva). */
export const EditorAddButton = ({ icon, children, ...props }: EditorAddButtonProps) => (
  <button type="button" className={styles.addButton} {...props}>
    <span aria-hidden="true" className="d-inline-flex">{icon}</span>
    {children}
  </button>
);

interface EditorFooterButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type"> {
  variant: "primary" | "secondary";
}

/** Botones del pie de la lista: confirmar o cancelar la edición en curso. */
export const EditorFooterButton = ({ variant, ...props }: EditorFooterButtonProps) => (
  <button
    type="button"
    className={`${styles.footerButton} ${variant === "primary" ? styles.footerPrimary : styles.footerSecondary}`}
    {...props}
  />
);
