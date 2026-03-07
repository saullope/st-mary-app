"use client";

import { useActivityEditor } from "@/context/ActivityEditorContext";
import { saveActivity } from "@/app/actions/saveActivity";
import { useState } from "react";
import { useRouter } from "next/navigation";

export const SaveActivityButton = () => {
  const { state, resetEditor } = useActivityEditor();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Preparar datos para el Server Action
      // Aquí mapeamos el estado del contexto al formato que espera el action
      const activityData = {
        title: state.title,
        type: state.activityType || "ludiquiz", // Fallback por seguridad
        questions: state.questions,
        config: state.config,
        memoryImages: state.memoryImages
      };

      // 2. Llamar al Server Action
      const result = await saveActivity(activityData);

      if (result.error) {
        alert(`Error: ${result.error}`);
        return;
      }

      // 3. Descargar JSON (Modo Simulación)
      if (result.data) {
        const jsonString = JSON.stringify(result.data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("¡Actividad guardada en Base de Datos! Respaldo JSON descargado.");
      } else {
        alert("Actividad guardada exitosamente en la Base de Datos.");
      }

      // 4. Limpiar y Redirigir
      resetEditor();
      router.push("/dashboard"); 

    } catch (error) {
      console.error("Error saving:", error);
      alert("Ocurrió un error inesperado al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-success d-flex align-items-center gap-2"
      onClick={handleSave}
      disabled={loading}
      style={{
        fontWeight: "bold",
        borderRadius: "20px",
        padding: "8px 20px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #28a745 0%, #218838 100%)",
        border: "none"
      }}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Guardando...
        </>
      ) : (
        <>
           Guardar
        </>
      )}
    </button>
  );
};
