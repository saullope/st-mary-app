"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { softDeleteActivity } from "@/app/dashboard/my-activities/actions";
import { useRouter } from "next/navigation";

export function DeleteActivityViewButton({ activityId, activityName }: { activityId: number, activityName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas dar de baja la actividad "${activityName}"?`)) {
      setIsDeleting(true);
      const result = await softDeleteActivity(activityId);
      if (!result.success) {
        alert(result.error);
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
        title="Dar de baja actividad"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', opacity: isDeleting ? 0.7 : 1 }}
    >
      {isDeleting ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '14px', height: '14px' }}></span>
      ) : (
          <FaTrash />
      )}
    </button>
  );
}
