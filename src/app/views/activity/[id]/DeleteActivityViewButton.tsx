"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { softDeleteActivity } from "@/app/dashboard/my-activities/actions";
import { notify } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function DeleteActivityViewButton({ activityId, activityName }: { activityId: number, activityName: string }) {
  const t = useTranslations("ActivityView");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(t("confirmDelete", { name: activityName }))) {
      setIsDeleting(true);
      const result = await softDeleteActivity(activityId);
      if (!result.success) {
        notify.error(t("deleteFailed"), result.error || t("tryAgain"));
        setIsDeleting(false);
      } else {
        // Redirigir al dashboard tras eliminar exitosamente
        router.push("/dashboard/my-activities");
      }
    }
  };

  return (
    <button 
        className="btn btn-outline-danger d-flex align-items-center gap-2 shadow-sm"
        title={t("delete")}
        aria-label={t("delete")}
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', opacity: isDeleting ? 0.7 : 1 }}
    >
      {isDeleting ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
      ) : (
          <FaTrash aria-hidden="true" />
      )}
    </button>
  );
}
