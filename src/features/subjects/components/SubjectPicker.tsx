"use client";

import { useTranslations } from "next-intl";
import { FaCheck } from "react-icons/fa6";
import type { Subject } from "../subjectSchemas";
import styles from "./SubjectPicker.module.css";

interface SubjectPickerProps {
  subjects: Subject[];
  value: number[];
  onChange: (ids: number[]) => void;
  /** Nombre del grupo para lectores de pantalla. */
  label: string;
}

/** Clases como chips seleccionables: se pueden elegir varias o ninguna. */
export default function SubjectPicker({ subjects, value, onChange, label }: SubjectPickerProps) {
  const t = useTranslations("Subjects");

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((selected) => selected !== id) : [...value, id]);

  return (
    <div className={styles.group} role="group" aria-label={label}>
      {subjects.map((subject) => {
        const selected = value.includes(subject.id);
        return (
          <button
            key={subject.id}
            type="button"
            className={styles.chip}
            aria-pressed={selected}
            onClick={() => toggle(subject.id)}
          >
            {selected && <FaCheck aria-hidden="true" />}
            {t.has(subject.codigo) ? t(subject.codigo) : subject.codigo}
          </button>
        );
      })}
    </div>
  );
}
