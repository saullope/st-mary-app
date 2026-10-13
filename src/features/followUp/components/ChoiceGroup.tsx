"use client";

import type { LucideIcon } from "lucide-react";
import styles from "./followUp.module.css";

export interface Choice<T extends string | number> {
  value: T;
  label: string;
  /** Nombre accesible si difiere del texto visible (p. ej. "4 de 5: Me gustó"). */
  ariaLabel?: string;
  Icon?: LucideIcon;
}

interface ChoiceGroupProps<T extends string | number> {
  name: string;
  legend: string;
  choices: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

/** Grupo de radios nativos con nombre (fieldset + legend), usado en todas las escalas de seguimiento. */
export function ChoiceGroup<T extends string | number>({ name, legend, choices, value, onChange }: ChoiceGroupProps<T>) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {choices.map((choice) => {
          const id = `${name}-${choice.value}`;
          return (
            <div key={id} className={styles.option}>
              <input
                type="radio"
                id={id}
                name={name}
                className={styles.radio}
                checked={value === choice.value}
                onChange={() => onChange(choice.value)}
                aria-label={choice.ariaLabel}
              />
              <label htmlFor={id} className={styles.choice}>
                {choice.Icon && <choice.Icon className={styles.choiceIcon} aria-hidden />}
                <span>{choice.label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
