"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { softDeleteActivity } from "./actions";
import styles from "@/styles/pages/my-activities.module.css";

export function DeleteActivityButton({ activityId, activityName }: { activityId: number, activityName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Confirmación nativa sencilla por ahora (luego podemos mejorarla visualmente)
    if (window.confirm(`¿Estás seguro de que deseas eliminar la actividad "${activityName}"?`)) {
      setIsDeleting(true);
      const result = await softDeleteActivity(activityId);
      
      if (!result.success) {
        alert(result.error);
        setIsDeleting(false); // Restablecer si falla
      }
      // Si tiene éxito, Next.js revalidará la página y el componente desaparecerá
    }
  };

  return (
    <button 
        className={`${styles.actionButtonIcon} ${styles.deleteIcon}`} 
        title="Eliminar"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ opacity: isDeleting ? 0.5 : 1, cursor: isDeleting ? 'not-allowed' : 'pointer' }}
    >
      {isDeleting ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
      ) : (
          <FaTrash size={18} />
      )}
    </button>
  );
}
