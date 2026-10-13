"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { softDeleteActivity } from "./actions";
import styles from "@/styles/pages/my-activities.module.css";
import { notify } from "@/components/ui";
import { useTranslations } from "next-intl";

export function DeleteActivityButton({ activityId, activityName, titleButton }: { activityId: number, activityName: string, titleButton: string }) {
  const t = useTranslations("MyActivities");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(t("confirmDelete", { name: activityName }))) {
      setIsDeleting(true);
      const result = await softDeleteActivity(activityId);
      
      if (!result.success) {
        notify.error(t("deleteFailed"), result.error || t("tryAgain"));
        setIsDeleting(false); // Restablecer si falla
      }
      // Si tiene éxito, Next.js revalidará la página y el componente desaparecerá
    }
  };

  return (
    <button 
        className={`${styles.actionButtonIcon} ${styles.deleteIcon}`} 
        title={titleButton}
        aria-label={`${titleButton}: ${activityName}`}
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ opacity: isDeleting ? 0.5 : 1, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
    >
      {isDeleting ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
      ) : (
          <FaTrash size={18} aria-hidden="true" />
      )}
    </button>
  );
}
