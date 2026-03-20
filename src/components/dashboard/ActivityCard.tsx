"use client";

import { useState } from "react";
import Link from "next/link";
import { FaPlay, FaPenToSquare, FaShareNodes, FaGamepad, FaListCheck, FaBrain, FaCheck, FaRocket } from "react-icons/fa6";
import styles from "@/styles/pages/my-activities.module.css";
import { DeleteActivityButton } from "@/app/dashboard/my-activities/DeleteActivityButton";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";
import CreatorCard from "./CreatorCard";

interface ActivityCardProps {
  activity: any;
  gradeLabel: string;
  typeBadgeClass: string;
  sessionPicture?: string;
  isAdmin: boolean;
}

export default function ActivityCard({ activity, gradeLabel, typeBadgeClass, sessionPicture, isAdmin }: ActivityCardProps) {
  const [copied, setCopied] = useState(false);
  const [sessionPin, setSessionPin] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    const result = await createGameSession(activity.activityId);
    if (result.success) {
        setSessionPin(result.pin || "");
    } else {
        alert(result.error);
    }
    setIsLaunching(false);
  };

  const handleShare = async () => {
    // Generate the URL to copy
    const url = `${window.location.origin}/views/activity/${activity.activityId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const getIcon = (id: number) => {
    switch(id) {
      case 1: return <FaListCheck size={28} />; // Quiz
      case 2: return <FaGamepad size={28} />; // Verdadero/Falso
      case 3: return <FaBrain size={28} />; // LudiMemory
      default: return <FaGamepad size={28} />;
    }
  };

  const getEditRoute = (id: number) => {
    switch(id) {
      case 1: return `/create/ludiquiz?id=${activity.activityId}`;
      case 2: return `/create/trueorfalse?id=${activity.activityId}`;
      case 3: return `/create/ludimemory?id=${activity.activityId}`;
      default: return `/create?id=${activity.activityId}`;
    }
  };

  return (
    <div className={styles.activityCard}>
      <div className={styles.cardHeader}>
        <div className={`${styles.iconContainer} ${typeBadgeClass}`}>
          {getIcon(activity.tipoActividadId)}
        </div>
        <div className={styles.cardBadges}>
          <span className={styles.gradeBadge}>{gradeLabel}</span>
          <span className={styles.codeBadge}>#{activity.activityId}</span>
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle} title={activity.activity.activity_name}>
          {activity.activity.activity_name}
        </h3>
        <p className={styles.cardDate}>
          Creado el {new Date(activity.activity.created_date).toLocaleDateString()}
        </p>
        <div className="d-flex justify-content-between align-items-center w-100 mt-2">
          <span className={`${styles.badgeType} ${typeBadgeClass}`}>
            {activity.tipoActividad.nombre}
          </span>
          <div className={styles.creatorWrapper}>
            <CreatorCard 
              name={activity.user.nombre} 
              email={activity.user.email} 
              pictureUrl={sessionPicture}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        {sessionPin ? (
            <div className="w-100 text-center p-2 bg-success text-white rounded mb-2 animate__animated animate__flipInX">
                <small className="d-block">CÓDIGO PARA ALUMNOS:</small>
                <strong style={{ fontSize: '1.5rem', letterSpacing: '4px' }}>{sessionPin}</strong>
            </div>
        ) : null}
        <div className={styles.actionGroup}>
          <button 
            className={`${styles.actionButtonIcon} ${styles.shareIcon}`} 
            onClick={handleShare}
            title="Copiar enlace"
          >
            {copied ? <FaCheck size={18} /> : <FaShareNodes size={18} />}
          </button>
          <button 
            className={`${styles.actionButtonIcon} ${styles.rocketIcon}`} 
            onClick={handleLaunch}
            disabled={isLaunching}
            title="Lanzar Partida (Generar PIN)"
            style={{ backgroundColor: '#ff9f43', color: 'white' }}
          >
            {isLaunching ? (
                <span className="spinner-border spinner-border-sm" />
            ) : (
                <FaRocket size={18} />
            )}
          </button>
          <Link 
            href={`/views/activity/${activity.activityId}`} 
            className={`${styles.actionButtonIcon} ${styles.playIcon}`} 
            title="Jugar/Previsualizar"
            target="_blank" rel="noopener noreferrer"
          >
            <FaPlay size={18} />
          </Link>
          <Link 
            href={getEditRoute(activity.tipoActividadId)} 
            className={`${styles.actionButtonIcon} ${styles.editIcon}`} 
            title="Editar"
          >
            <FaPenToSquare size={18} />
          </Link>
          <DeleteActivityButton 
            activityId={activity.activityId} 
            activityName={activity.activity.activity_name} 
          />
        </div>
      </div>
    </div>
  );
}
