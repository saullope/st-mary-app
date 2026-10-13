"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import { notify } from "@/components/ui";
import { reviewWrittenAnswer } from "@/app/dashboard/reports/[id]/reviewActions";
import { useTranslations } from "next-intl";

interface WrittenAnswerReviewProps {
  respuestaId: number;
  /** null mientras la respuesta está pendiente de revisión. */
  approved: boolean | null;
  onReviewed: (approved: boolean) => void;
}

/** Botones para que el docente califique una respuesta escrita de LudiForm. */
export default function WrittenAnswerReview({ respuestaId, approved, onReviewed }: WrittenAnswerReviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("SessionLog");
  const [editing, setEditing] = useState(approved === null);

  const review = (value: boolean) => {
    startTransition(async () => {
      const result = await reviewWrittenAnswer(respuestaId, value);
      if (result.error) {
        notify.error(t("reviewFailed"), result.error);
        return;
      }
      onReviewed(value);
      setEditing(false);
      // Actualiza puntajes y estadísticas del resto del reporte.
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <button type="button" className="btn btn-sm btn-link p-0 text-decoration-none" onClick={() => setEditing(true)}>
        {t("changeGrade")}
      </button>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap" role="group" aria-label={t("gradeAnswer")}>
      <span className="small fw-semibold" style={{ color: "#4a4266" }}>{t("isCorrect")}</span>
      <button type="button" className="btn btn-sm btn-success d-flex align-items-center gap-1" disabled={isPending} onClick={() => review(true)}>
        <FaCheck aria-hidden="true" /> {t("correct")}
      </button>
      <button type="button" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" disabled={isPending} onClick={() => review(false)}>
        <FaTimes aria-hidden="true" /> {t("incorrect")}
      </button>
    </div>
  );
}
