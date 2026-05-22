"use client";

import { useState } from "react";
import Image from "next/image";
import { FaListCheck, FaGamepad, FaBrain, FaClone, FaEye, FaRocket, FaCheck } from "react-icons/fa6";
import styles from "@/styles/pages/my-activities.module.css";
import { cloneTemplateActivity } from "./actions";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";

interface TemplateCardProps {
  template: any;
  userId: string;
}

export default function TemplateCard({ template, userId }: TemplateCardProps) {
  const [cloning, setCloning] = useState(false);
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    const result = await createGameSession(template.activityId);
    if (result.success) {
        setSessionPin(result.pin || "");
    } else {
        alert(result.error);
    }
    setIsLaunching(false);
  };

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
    <div className={`${styles.activityCard} position-relative`}>
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
        <p className={styles.cardDate}>
          {template.activity.activity_desc || "Plantilla oficial de LudiGame."}
        </p>
        <div className="d-flex justify-content-between align-items-center w-100 mt-3">
          <span className={`${styles.badgeType} ${typeBadgeClass}`}>
            {template.tipoActividad.nombre}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter} style={{ padding: "1.25rem", borderTop: "1px dashed rgba(29, 21, 58, 0.1)", display: "flex", flexDirection: "column", gap: "10px" }}>
        {sessionPin && (
            <div className="w-100 text-center p-2 bg-success text-white rounded" style={{ fontSize: '0.9rem' }}>
                PIN PARA ALUMNOS: <strong>{sessionPin}</strong>
            </div>
        )}
        <div className="d-flex w-100 gap-2">
            <button 
            onClick={handleClone} 
            disabled={cloning}
            className="btn flex-grow-1 d-flex justify-content-center align-items-center gap-2"
            style={{
                background: cloning ? 'rgba(29, 21, 58, 0.1)' : '#1D153A',
                color: cloning ? 'rgba(29, 21, 58, 0.5)' : 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                padding: '10px',
                border: 'none',
                boxShadow: cloning ? 'none' : '0 4px 15px rgba(29, 21, 58, 0.2)',
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

            <button 
                onClick={handleLaunch}
                disabled={isLaunching}
                className="btn d-flex justify-content-center align-items-center"
                title="Lanzar partida inmediata"
                style={{
                    background: 'white',
                    color: '#ff9f43',
                    border: '1px solid rgba(255, 159, 67, 0.5)',
                    borderRadius: '12px',
                    padding: '10px 15px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ff9f43'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#ff9f43'; }}
            >
                {isLaunching ? <span className="spinner-border spinner-border-sm" /> : <FaRocket />}
            </button>

            <a 
            href={`/views/activity/${template.activityId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn d-flex justify-content-center align-items-center"
            title="Previsualizar"
            style={{
                background: 'white',
                color: '#1D153A',
                border: '1px solid rgba(29, 21, 58, 0.2)',
                borderRadius: '12px',
                padding: '10px 15px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1D153A'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1D153A'; }}
            >
            <FaEye />
            </a>
        </div>
      </div>
    </div>
  );
}
