"use client";

import { FaPlus, FaTrash } from "react-icons/fa6";
import { EditorCard, editorFieldStyles as fields } from "@/components/editor";
import { FORM_QUESTION_LABELS, type FormOption, type FormQuestion } from "@/features/form/formQuestions";
import { FORM_TYPE_ICONS, FORM_TYPE_COLORS } from "./FormQuestionList";
import styles from "./FormQuestionEditor.module.css";

const MAX_OPTIONS = 6;

interface FormQuestionEditorProps {
  question: FormQuestion;
  onChange: (changes: Partial<FormQuestion>) => void;
}

/** Edición de una pregunta de LudiForm: enunciado y, si es cerrada, sus opciones. */
export const FormQuestionEditor = ({ question, onChange }: FormQuestionEditorProps) => {
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
    <EditorCard icon={FORM_TYPE_ICONS[question.type]} label={FORM_QUESTION_LABELS[question.type]} color={FORM_TYPE_COLORS[question.type]}>
      <label htmlFor={`form-question-${question.id}`} className={fields.fieldLabel}>Enunciado</label>
      <textarea
        id={`form-question-${question.id}`}
        className={fields.textArea}
        rows={2}
        maxLength={500}
        placeholder="Escribe la pregunta..."
        value={question.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />

      {question.type === "long" ? (
        <div className={styles.longInfo}>
          El estudiante escribirá su respuesta con sus propias palabras. La revisarás desde Reportes y, si la apruebas,
          sumará los puntos configurados en el Panel Lúdico.
        </div>
      ) : (
        <fieldset className={styles.options}>
          <legend className={fields.fieldLabel}>
            Opciones <span className={fields.fieldHint}>{isSingle ? "(marca la correcta)" : "(marca todas las correctas)"}</span>
          </legend>
          {question.options.map((option, index) => (
            <div key={option.id} className={styles.optionRow} data-correct={option.isCorrect}>
              <input
                type={isSingle ? "radio" : "checkbox"}
                name={`correct-${question.id}`}
                checked={option.isCorrect}
                onChange={() => toggleCorrect(option.id)}
                aria-label={`Marcar la opción ${index + 1} como correcta`}
              />
              <input
                type="text"
                className={fields.textInput}
                maxLength={200}
                placeholder={`Opción ${index + 1}`}
                value={option.text}
                onChange={(e) => updateOption(option.id, { text: e.target.value })}
                aria-label={`Texto de la opción ${index + 1}`}
              />
              <button
                type="button"
                className={styles.removeOption}
                onClick={() => removeOption(option.id)}
                disabled={question.options.length <= 2}
                aria-label={`Eliminar opción ${index + 1}`}
                title="Eliminar opción"
              >
                <FaTrash aria-hidden="true" />
              </button>
            </div>
          ))}
          {question.options.length < MAX_OPTIONS && (
            <button type="button" className={fields.secondaryButton} onClick={addOption}>
              <FaPlus aria-hidden="true" /> Agregar opción
            </button>
          )}
        </fieldset>
      )}
    </EditorCard>
  );
};
