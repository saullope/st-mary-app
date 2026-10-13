"use client";

import { FaPlus, FaTrash } from "react-icons/fa6";
import { EditorCard, editorFieldStyles as fields } from "@/components/editor";
import type { FormOption, FormQuestion } from "@/features/form/formQuestions";
import { FORM_TYPE_ICONS, FORM_TYPE_COLORS } from "./FormQuestionList";
import styles from "./FormQuestionEditor.module.css";
import { useTranslations } from "next-intl";

const MAX_OPTIONS = 6;

interface FormQuestionEditorProps {
  question: FormQuestion;
  onChange: (changes: Partial<FormQuestion>) => void;
}

/** Edición de una pregunta de LudiForm: enunciado y, si es cerrada, sus opciones. */
export const FormQuestionEditor = ({ question, onChange }: FormQuestionEditorProps) => {
  const t = useTranslations("Editor.form");
  const isSingle = question.type === "single";

  const updateOption = (id: number, changes: Partial<FormOption>) =>
    onChange({ options: question.options.map((o) => (o.id === id ? { ...o, ...changes } : o)) });

  const toggleCorrect = (id: number) =>
    onChange({
      options: question.options.map((o) =>
        // En opción única marcar una desmarca las demás.
        o.id === id ? { ...o, isCorrect: isSingle ? true : !o.isCorrect } : isSingle ? { ...o, isCorrect: false } : o
      ),
    });

  const addOption = () => {
    const nextId = question.options.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    onChange({ options: [...question.options, { id: nextId, text: "", isCorrect: false }] });
  };

  const removeOption = (id: number) => onChange({ options: question.options.filter((o) => o.id !== id) });

  return (
    <EditorCard icon={FORM_TYPE_ICONS[question.type]} label={t(`types.${question.type}`)} color={FORM_TYPE_COLORS[question.type]}>
      <label htmlFor={`form-question-${question.id}`} className={fields.fieldLabel}>{t("questionText")}</label>
      <textarea
        id={`form-question-${question.id}`}
        className={fields.textArea}
        rows={2}
        maxLength={500}
        placeholder={t("questionPlaceholder")}
        value={question.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />

      {question.type === "long" ? (
        <div className={styles.longInfo}>
          {t("longInfo")}
        </div>
      ) : (
        <fieldset className={styles.options}>
          <legend className={fields.fieldLabel}>
            {t("options")} <span className={fields.fieldHint}>{isSingle ? t("markOneHint") : t("markAllHint")}</span>
          </legend>
          {question.options.map((option, index) => (
            <div key={option.id} className={styles.optionRow} data-correct={option.isCorrect}>
              <input
                type={isSingle ? "radio" : "checkbox"}
                name={`correct-${question.id}`}
                checked={option.isCorrect}
                onChange={() => toggleCorrect(option.id)}
                aria-label={t("markCorrect", { number: index + 1 })}
              />
              <input
                type="text"
                className={fields.textInput}
                maxLength={200}
                placeholder={t("optionPlaceholder", { number: index + 1 })}
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                aria-label={t("optionText", { number: index + 1 })}
              />
              <button
                type="button"
                className={styles.removeOption}
                onClick={() => removeOption(option.id)}
                disabled={question.options.length <= 2}
                aria-label={t("deleteOptionFor", { number: index + 1 })}
                title={t("deleteOption")}
              >
                <FaTrash aria-hidden="true" />
              </button>
            </div>
          ))}
          {question.options.length < MAX_OPTIONS && (
            <button type="button" className={fields.secondaryButton} onClick={addOption}>
              <FaPlus aria-hidden="true" /> {t("addOption")}
            </button>
          )}
        </fieldset>
      )}
    </EditorCard>
  );
};
