"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaTimes } from "react-icons/fa";
import { notify } from "@/components/ui";
import { reviewWrittenAnswer } from "@/app/dashboard/reports/[id]/reviewActions";

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
  const [editing, setEditing] = useState(approved === null);

  const review = (value: boolean) => {
    startTransition(async () => {
      const result = await reviewWrittenAnswer(respuestaId, value);
      if (result.error) {
        notify.error("No se pudo guardar la revisión", result.error);
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
        Cambiar calificación
      </button>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap" role="group" aria-label="Calificar respuesta escrita">
      <span className="small fw-semibold" style={{ color: "#4a4266" }}>¿La respuesta es correcta?</span>
      <button type="button" className="btn btn-sm btn-success d-flex align-items-center gap-1" disabled={isPending} onClick={() => review(true)}>
        <FaCheck aria-hidden="true" /> Correcta
      </button>
      <button type="button" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" disabled={isPending} onClick={() => review(false)}>
        <FaTimes aria-hidden="true" /> Incorrecta
      </button>
    </div>
  );
}
