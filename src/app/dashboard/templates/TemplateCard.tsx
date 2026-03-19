"use client";

import { useState } from "react";
import { FaListCheck, FaGamepad, FaBrain, FaClone } from "react-icons/fa6";
import styles from "@/styles/pages/my-activities.module.css";
import { cloneTemplateActivity } from "./actions";

interface TemplateCardProps {
  template: any;
  userId: string;
}

export default function TemplateCard({ template, userId }: TemplateCardProps) {
  const [cloning, setCloning] = useState(false);

  const getIcon = (id: number) => {
    switch (id) {
      case 1: return <FaListCheck size={28} />;
      case 2: return <FaGamepad size={28} />;
      case 3: return <FaBrain size={28} />;
      default: return <FaGamepad size={28} />;
    }
  };

  const getBadgeClass = (id: number) => {
    switch (id) {
      case 1: return styles.badgeQuiz;
      case 2: return styles.badgeTF;
      case 3: return styles.badgeMemory;
      default: return "bg-light text-dark";
    }
  };

  const typeBadgeClass = getBadgeClass(template.tipoActividadId);

  const handleClone = async () => {
    setCloning(true);
    try {
      const result = await cloneTemplateActivity(template.activityId, userId);
      if (result.success && result.newActivityId) {
        // Redirect to edit the newly cloned activity
        const editRoute = template.tipoActividadId === 1 
            ? `/create/ludiquiz?id=${result.newActivityId}`
            : template.tipoActividadId === 2 
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
    <div className={`${styles.activityCard} position-relative`} style={{ borderTop: "4px solid #667eea" }}>
      <div className={styles.cardHeader}>
        <div className={`${styles.iconContainer} ${typeBadgeClass}`}>
          {getIcon(template.tipoActividadId)}
        </div>
        <div className={styles.cardBadges}>
          <span className={styles.gradeBadge} style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: 'white', fontWeight: 'bold' }}>
            {template.tema?.nombre || "General"}
          </span>
          <span className={styles.gradeBadge}>{template.grado?.grade_type_name || "Todos"}</span>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle} title={template.activity.activity_name}>
          {template.activity.activity_name}
        </h3>
        <p className={styles.cardDate} style={{ fontSize: "0.9rem", color: "#64748b" }}>
          {template.activity.activity_desc || "Plantilla oficial de LudiGame."}
        </p>
        <div className="d-flex justify-content-between align-items-center w-100 mt-3">
          <span className={`${styles.badgeType} ${typeBadgeClass}`}>
            {template.tipoActividad.nombre}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter} style={{ padding: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <button 
          onClick={handleClone} 
          disabled={cloning}
          className="btn w-100 d-flex justify-content-center align-items-center gap-2"
          style={{
            background: cloning ? '#e2e8f0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: cloning ? '#94a3b8' : 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '10px',
            boxShadow: cloning ? 'none' : '0 4px 15px rgba(118, 75, 162, 0.3)',
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
              Usar esta plantilla
            </>
          )}
        </button>
      </div>
    </div>
  );
}
