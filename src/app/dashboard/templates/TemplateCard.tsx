"use client";

import { useState } from "react";
import Image from "next/image";
import { FaListCheck, FaGamepad, FaBrain, FaClone, FaPlay } from "react-icons/fa6";
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
  const hasImage = !!template.activity?.image_url;

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
    <div className={`${styles.activityCard} position-relative`} style={{ borderTop: "4px solid #667eea", overflow: "hidden" }}>
      <div 
        className={styles.cardHeader} 
        style={hasImage ? { 
          padding: 0, 
          position: "relative", 
          height: "140px", 
          display: "block" 
        } : {}}
      >
        {hasImage ? (
          <>
            <Image 
              src={template.activity.image_url} 
              alt={template.activity.activity_name || "Template cover"} 
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div style={{ 
              position: "absolute", 
              top: 0, left: 0, right: 0, bottom: 0, 
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))" 
            }} />
            <div className={styles.cardBadges} style={{ position: "absolute", bottom: "12px", right: "12px", zIndex: 1, display: "flex", gap: "8px" }}>
              <span className={styles.gradeBadge} style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: 'white', fontWeight: 'bold' }}>
                {template.tema?.nombre || "General"}
              </span>
              <span className={styles.gradeBadge}>{template.grado?.grade_type_name || "Todos"}</span>
            </div>
            <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 1 }}>
              <div className={`${styles.iconContainer} ${typeBadgeClass}`} style={{ width: "36px", height: "36px", minWidth: "36px" }}>
                {getIcon(template.tipoActividadId)}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.iconContainer} ${typeBadgeClass}`}>
              {getIcon(template.tipoActividadId)}
            </div>
            <div className={styles.cardBadges}>
              <span className={styles.gradeBadge} style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', color: 'white', fontWeight: 'bold' }}>
                {template.tema?.nombre || "General"}
              </span>
              <span className={styles.gradeBadge}>{template.grado?.grade_type_name || "Todos"}</span>
            </div>
          </>
        )}
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

      <div className={styles.cardFooter} style={{ padding: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.05)", display: "flex", gap: "10px" }}>
        <button 
          onClick={handleClone} 
          disabled={cloning}
          className="btn flex-grow-1 d-flex justify-content-center align-items-center gap-2"
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
              Usar plantilla
            </>
          )}
        </button>

        <a 
          href={`/views/activity/${template.activityId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn d-flex justify-content-center align-items-center"
          title="Previsualizar plantilla"
          style={{
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '10px 15px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#e2e8f0';
            e.currentTarget.style.color = '#334155';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#f1f5f9';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <FaPlay />
        </a>
      </div>
    </div>
  );
}
