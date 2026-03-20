"use client";

import { useState } from "react";
import { FaClone } from "react-icons/fa6";
import { cloneTemplateActivity } from "@/app/dashboard/templates/actions";

interface UseTemplateButtonProps {
  templateActivityId: number;
  tipoActividadId: number;
  userId: string;
}

export default function UseTemplateButton({ templateActivityId, tipoActividadId, userId }: UseTemplateButtonProps) {
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    setCloning(true);
    try {
      const result = await cloneTemplateActivity(templateActivityId, userId);
      if (result.success && result.newActivityId) {
        const editRoute = tipoActividadId === 1 
            ? `/create/ludiquiz?id=${result.newActivityId}`
            : tipoActividadId === 2 
                ? `/create/trueorfalse?id=${result.newActivityId}`
                : `/create/ludimemory?id=${result.newActivityId}`;
        
        window.location.href = editRoute;
      } else {
        alert(result.error || "Ocurrió un error al clonar la plantilla.");
        setCloning(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado al usar la plantilla.");
      setCloning(false);
    }
  };

  return (
    <button 
      onClick={handleClone} 
      disabled={cloning}
      className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
      style={{
        borderRadius: '12px',
        padding: '8px 16px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
      }}
    >
      {cloning ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Preparando...
        </>
      ) : (
        <>
          <FaClone />
          Usar plantilla
        </>
      )}
    </button>
  );
}
