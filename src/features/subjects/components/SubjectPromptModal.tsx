"use client";

import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { notify } from "@/components/ui";
import { useTourPreferences } from "@/hooks/useTourPreferences";
import { subjectPromptId } from "@/lib/tours/tourProgress";
import type { Subject } from "../subjectSchemas";
import SubjectPicker from "./SubjectPicker";

interface SubjectPromptModalProps {
  /** Grado recién elegido; null cierra el modal. */
  gradeId: number | null;
  subjects: Subject[];
  /** Se llama al guardar o al omitir: continuar hacia el panel. */
  onFinish: () => void;
}

/**
 * Tras elegir el grado por primera vez, ofrece elegir las clases que imparte el
 * educador. Es opcional: "Omitir por ahora" no vuelve a preguntar para ese grado,
 * y se puede cambiar en Configuración > Preferencias.
 */
export default function SubjectPromptModal({ gradeId, subjects, onFinish }: SubjectPromptModalProps) {
  const t = useTranslations("SubjectPrompt");
  const tCommon = useTranslations("Common");
  const { markTourAsCompleted, postponeTours } = useTourPreferences();
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  if (gradeId === null) return null;
  const gradeName = tCommon(`grades.${gradeId as 1 | 2 | 3}`);

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
    <Modal show onHide={skip} centered aria-labelledby="subject-prompt-title">
      <Modal.Header closeButton closeLabel={t("skip")}>
        <Modal.Title id="subject-prompt-title" as="h2" style={{ fontSize: "var(--text-card)", fontWeight: 700, color: "#1D153A" }}>
          {t("title", { grade: gradeName })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ fontSize: "var(--text-base)", color: "#4a4266" }}>{t("description")}</p>
        <SubjectPicker subjects={subjects} value={selected} onChange={setSelected} label={t("title", { grade: gradeName })} />
        <p className="mt-3 mb-0" style={{ fontSize: "var(--text-meta)", color: "#5E5878" }}>{t("hint")}</p>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-link text-decoration-none" style={{ color: "#5E5878", fontSize: "var(--text-ui)" }} onClick={skip} disabled={saving}>
          {t("skip")}
        </button>
        <button
          type="button"
          className="btn"
          style={{ background: "#6a4bff", color: "#ffffff", fontWeight: 700, borderRadius: "10px", fontSize: "var(--text-ui)" }}
          onClick={save}
          disabled={saving}
        >
          {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {selected.length > 0 ? t("save") : t("continue")}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
