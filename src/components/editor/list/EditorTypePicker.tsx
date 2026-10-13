"use client";

import { useId, useState } from "react";
import type { IconType } from "react-icons";
import { FaPlus, FaXmark } from "react-icons/fa6";
import { EditorAddButton } from "./EditorButtons";
import styles from "./EditorList.module.css";
import { useTranslations } from "next-intl";

export interface EditorTypeOption<T extends string> {
  value: T;
  label: string;
  icon: IconType;
  color: string;
}

interface EditorTypePickerProps<T extends string> {
  /** Texto del botón cerrado, p. ej. "Agregar bloque". */
  label: string;
  /** Nombre accesible del grupo de opciones. */
  groupLabel: string;
  options: EditorTypeOption<T>[];
  hint?: string;
  onPick: (value: T) => void;
}

/** Botón de agregar que despliega los tipos de elemento disponibles. */
export const EditorTypePicker = <T extends string>({ label, groupLabel, options, hint, onPick }: EditorTypePickerProps<T>) => {
  const [open, setOpen] = useState(false);
  const pickerId = useId();
  const t = useTranslations("Editor.list");

  const pick = (value: T) => {
    setOpen(false);
    onPick(value);
  };

  return (
    <>
      <EditorAddButton
        icon={open ? <FaXmark /> : <FaPlus />}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={pickerId}
      >
        {open ? t("close") : label}
      </EditorAddButton>

      {open && (
        <div id={pickerId} className={styles.picker} role="group" aria-label={groupLabel}>
          {options.map(({ value, label: optionLabel, icon: Icon, color }) => (
            <button key={value} type="button" className={styles.pickerOption} onClick={() => pick(value)}>
              <span className={styles.pickerIcon} style={{ color }} aria-hidden="true"><Icon /></span>
              {optionLabel}
            </button>
          ))}
          {hint && <p className={styles.pickerHint}>{hint}</p>}
        </div>
      )}
    </>
  );
};
