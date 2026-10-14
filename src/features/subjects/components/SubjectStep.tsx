"use client";

import { forwardRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FaArrowLeft } from "react-icons/fa6";
import { notify } from "@/components/ui";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { subjectPromptId } from "@/lib/tours/tourProgress";
import type { Subject } from "../subjectSchemas";
import SubjectPicker from "./SubjectPicker";
import styles from "./SubjectStep.module.css";

interface SubjectStepProps {
  gradeId: number;
  subjects: Subject[];
  /** Se llama al guardar o al omitir: continuar hacia el panel. */
  onFinish: () => void;
  /** Vuelve a la elección de grado. */
  onBack: () => void;
}

/**
 * Segundo paso de la bienvenida: tras elegir un grado por primera vez, ofrece elegir
 * las clases que imparte el educador. Es opcional: "Omitir por ahora" no vuelve a
 * preguntar para ese grado, y se puede cambiar en Configuración > Preferencias.
 * El ref apunta al título, para mover el foco al entrar en el paso.
 */
const SubjectStep = forwardRef<HTMLHeadingElement, SubjectStepProps>(function SubjectStep(
  { gradeId, subjects, onFinish, onBack },
  titleRef,
) {
  const t = useTranslations("SubjectPrompt");
  const tCommon = useTranslations("Common");
  const { markTourAsCompleted, postponeTours } = useTourPreferences();
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const gradeName = tCommon(`grades.${gradeId as 1 | 2 | 3}`);
  const title = t("title", { grade: gradeName });

  const skip = () => {
    postponeTours([subjectPromptId(gradeId)]);
    onFinish();
  };

  const save = async () => {
    if (selected.length === 0) return skip();
    setSaving(true);
    try {
      const response = await fetch("/api/user/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeId, materiaIds: selected }),
      });
      if (!response.ok) throw new Error(String(response.status));
      markTourAsCompleted(subjectPromptId(gradeId));
      onFinish();
    } catch {
      notify.error(t("saveFailed"));
      setSaving(false);
    }
  };

  return (
    <section className={styles.step} aria-labelledby="subject-step-title">
      <button type="button" className={styles.back} onClick={onBack} disabled={saving}>
        <FaArrowLeft aria-hidden="true" />
        {t("back")}
      </button>

      <h1 id="subject-step-title" ref={titleRef} tabIndex={-1} className={styles.title}>
        {title}
      </h1>
      <p className={styles.description}>{t("description")}</p>

      <div className={styles.card}>
        <SubjectPicker subjects={subjects} value={selected} onChange={setSelected} label={title} />
        <p className={styles.hint}>{t("hint")}</p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.skip} onClick={skip} disabled={saving}>
          {t("skip")}
        </button>
        <button type="button" className={styles.primary} onClick={save} disabled={saving} aria-busy={saving}>
          {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {selected.length > 0 ? t("save") : t("continue")}
        </button>
      </div>
    </section>
  );
});

export default SubjectStep;
