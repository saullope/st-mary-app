"use client";

import { useState } from "react";
import { FaClone } from "react-icons/fa6";
import { cloneTemplateActivity } from "@/app/dashboard/templates/actions";
import { notify } from "@/components/ui";
import { getEditorRoute, openPendingEditorTab } from "@/lib/editorTab";

interface UseTemplateButtonProps {
  templateActivityId: number;
  tipoActividadId: number;
}

export default function UseTemplateButton({ templateActivityId, tipoActividadId }: UseTemplateButtonProps) {
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    const editorTab = openPendingEditorTab();
    setCloning(true);
    try {
      const result = await cloneTemplateActivity(templateActivityId);
      if (result.success && result.newActivityId) {
        editorTab.navigate(getEditorRoute(tipoActividadId, result.newActivityId));
        setCloning(false);
      } else {
        editorTab.cancel();
        notify.error("No se pudo usar la plantilla", result.error || "Ocurrió un error al clonar la plantilla.");
        setCloning(false);
      }
    } catch (error) {
      console.error(error);
      editorTab.cancel();
      notify.error("Error inesperado al usar la plantilla.");
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
