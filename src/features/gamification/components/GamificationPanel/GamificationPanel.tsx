"use client";

import { useState, useEffect } from "react";
import { SelectableCard } from "@/features/gamification/components/SelectableCard/SelectableCard";
import styles from "./GamificationPanel.module.css";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { badgeCatalogFor, missionCatalogFor } from "@/features/gamification/achievementRules";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import { useGameVoice } from "@/features/gamification/useGameVoice";
import { useSelectedGrade, GRADE_LABELS } from "@/hooks/useSelectedGrade";

/** Textos del panel que cambian según cómo se gana en cada tipo de actividad. */
const PANEL_COPY: Record<string, { points: string; badges: string; grade: string }> = {
  ludileccion: {
    points: "",
    badges: "Selecciona las insignias que tus estudiantes podrán ganar al completar la lección.",
    grade: "de ahí dependen los bloques y misiones disponibles.",
  },
  ludiform: {
    points: "Puntos por cada pregunta de opción acertada o respuesta escrita que apruebes.",
    badges: "Selecciona las insignias que tus estudiantes podrán ganar al entregar el formulario.",
    grade: "de ahí dependen las misiones disponibles.",
  },
  ludimemory: {
    points: "Puntos que gana el estudiante por cada pareja que encuentra.",
    badges: "Selecciona las insignias que tus estudiantes podrán ganar mientras encuentran las parejas.",
    grade: "de ahí dependen las misiones disponibles.",
  },
};

const DEFAULT_COPY = {
  points: "Define los puntos que el estudiante gana por cada respuesta correcta.",
  badges: "Selecciona las insignias que podrán ganar tus estudiantes.",
  grade: "de ahí dependen las misiones disponibles.",
};

/** Panel Lúdico integrado en la columna derecha de cada editor (ver EditorGamificationColumn). */
export default function GamificationPanel() {
  const { state, updateConfig } = useActivityEditor();
  const { config, activityType } = state;
  // Solo LudiQuiz y Verdadero/Falso se juegan contra el reloj; las lecciones tampoco dan puntos.
  const hasTimer = activityType === "ludiquiz" || activityType === "trueorfalse";
  const hasPoints = activityType !== "ludileccion";
  const isMemory = activityType === "ludimemory";
  const copy = (activityType && PANEL_COPY[activityType]) || DEFAULT_COPY;
  const badges = badgeCatalogFor(activityType);
  const missionsByGrade = missionCatalogFor(activityType);

  // Una actividad guardada antes de tener catálogo propio puede traer insignias de otro tipo.
  useEffect(() => {
    if (!activityType) return;
    const valid = config.selectedBadges.filter((id) => badges.some((b) => b.id === id));
    if (valid.length !== config.selectedBadges.length) updateConfig({ selectedBadges: valid });
  }, [activityType, badges, config.selectedBadges, updateConfig]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { speak } = useGameVoice(config.voiceEnabled);

  // El grado ya no se elige aquí: se toma del grado que el docente
  // seleccionó en /welcome-educator, porque de eso dependen las misiones
  // disponibles. Se mantiene sincronizado en el estado del editor apenas
  // se conoce (o cambia).
  const selectedGradeId = useSelectedGrade();
  useEffect(() => {
    if (selectedGradeId && selectedGradeId !== config.gradeId) {
      updateConfig({ gradeId: selectedGradeId });
    }
  }, [selectedGradeId, config.gradeId, updateConfig]);

  const handleBadgeToggle = (id: string, phrase: string, name: string) => {
    const currentBadges = new Set(config.selectedBadges);
    if (currentBadges.has(id)) {
      currentBadges.delete(id);
    } else {
      currentBadges.add(id);
      // Feedback visual y auditivo al seleccionar
      triggerConfetti();
      if (config.voiceEnabled) speak(`Has seleccionado la insignia ${name}. ${phrase}`);
    }
    updateConfig({ selectedBadges: Array.from(currentBadges) });
  };

  const handleMissionToggle = (missionId: string, missionText: string) => {
    const currentMissions = new Set(config.selectedMissions || []);
    if (currentMissions.has(missionId)) {
      currentMissions.delete(missionId);
    } else {
      currentMissions.add(missionId);
      triggerConfetti();
      if (config.voiceEnabled) speak(`Misión seleccionada: ${missionText}`);
    }
    updateConfig({ selectedMissions: Array.from(currentMissions) });
  };

  const handleSave = () => {
    if (hasTimer && (!config.timeLimit || config.timeLimit <= 0)) {
      showFeedback("Por favor, ingresa un valor válido de tiempo.");
      return;
    }
    if (hasPoints && (!config.pointsPerCorrect || config.pointsPerCorrect <= 0)) {
      showFeedback("Por favor, ingresa un valor válido de puntos.");
      return;
    }
    if (config.selectedBadges.length === 0) {
      showFeedback("Por favor, selecciona al menos una insignia.");
      return;
    }

    showFeedback("¡Configuración guardada!");
    if (config.voiceEnabled) speak("¡Configuración guardada con éxito!");
    // Aquí ya no necesitamos hacer nada más porque el estado ya está actualizado en el Contexto
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); // Duración de la animación
  };

  return (
    <>
      <div
        id="sidebar-panel-ludico"
        data-tour="panel-ludico"
        className={`${styles.gamificationPanel} ${styles.embedded}`}
        role="region"
        aria-label="Panel de configuración lúdica"
      >
        <h3 className={styles.headerGlow}>Configuración Lúdica</h3>

        {/* Configuración general */}
        <section className={styles.sectionCard} aria-label="Configuración general">
          <h4 className={styles.sectionTitle}>Configuración general</h4>
          <div className={styles.configGrid}>
            <div className={styles.configFieldFull}>
              <span className={styles.label}>Grado:</span>
              <div className={styles.select} aria-live="polite">
                {GRADE_LABELS[config.gradeId] || "Sin definir"}
              </div>
              <div className={styles.desc}>
                {selectedGradeId
                  ? `Tomado del grado que seleccionaste en Bienvenida; ${copy.grade}`
                  : "No se detectó un grado seleccionado. Ve a la pantalla de Bienvenida para elegir uno."}
              </div>
            </div>

            {hasTimer && (
            <div>
              <label htmlFor="tiempo" className={styles.label}>
                Tiempo por actividad (segundos):
              </label>
              <input
                type="number"
                id="tiempo"
                min="10"
                max="300"
                placeholder="Ingresa el tiempo"
                className={styles.inputNumber}
                value={config.timeLimit || ""}
                onChange={(e) => updateConfig({ timeLimit: Number(e.target.value) })}
              />
              <div className={styles.desc}>
                Ajusta el tiempo que tiene el estudiante para responder.
              </div>
            </div>
            )}

            {hasPoints && (
            <div>
              <label htmlFor="puntos" className={styles.label}>
                {isMemory ? "Puntos por pareja encontrada:" : "Puntos por respuesta correcta:"}
              </label>
              <input
                type="number"
                id="puntos"
                min="1"
                max="100"
                placeholder="Ingresa los puntos"
                className={styles.inputNumber}
                value={config.pointsPerCorrect || ""}
                onChange={(e) => updateConfig({ pointsPerCorrect: Number(e.target.value) })}
              />
              <div className={styles.desc}>{copy.points}</div>
            </div>
            )}
          </div>
        </section>

        {/* Insignias */}
        <section className={styles.sectionCard} aria-label="Insignias de recompensa disponibles">
          <h4 className={styles.sectionTitle}>Insignias de recompensa</h4>
          <p className={styles.sectionHint}>{copy.badges}</p>
          <div className={styles.insigniasContainer}>
            {badges.map((badge) => (
              <SelectableCard
                key={badge.id}
                selected={config.selectedBadges.includes(badge.id)}
                onToggle={() => handleBadgeToggle(badge.id, badge.phrase, badge.name)}
                ariaLabel={`Insignia ${badge.name}: ${badge.desc}`}
                className={styles.badgeCard}
              >
                <BadgeArt badge={badge} size={72} className={styles.badgeImg} />
                <span className={styles.badgeName}>{badge.name}</span>
                <p className={styles.badgeDescription}>{badge.desc}</p>
              </SelectableCard>
            ))}
          </div>
        </section>

        {/* Misiones */}
        <section className={styles.sectionCard} aria-label="Misiones y Desafíos configurables">
          <h4 className={styles.sectionTitle}>Misiones y Desafíos</h4>
          <p className={styles.sectionHint}>
            Activa los retos opcionales que los estudiantes podrán completar.
          </p>
          <div id="misiones-container" className={styles.missionsGrid}>
            {missionsByGrade[config.gradeId]?.map((mision) => (
              <SelectableCard
                key={mision.id}
                selected={(config.selectedMissions || []).includes(mision.id)}
                onToggle={() => handleMissionToggle(mision.id, mision.studentText)}
                ariaLabel={`Misión: ${mision.text}`}
                className={styles.missionCard}
              >
                <span className={styles.missionDot} aria-hidden="true"></span>
                <span>{mision.text}</span>
              </SelectableCard>
            ))}
          </div>
        </section>

        {/* Toggle Voz */}
        <section className={styles.sectionCard} aria-label="Opciones de accesibilidad">
          <SelectableCard
            selected={config.voiceEnabled}
            onToggle={() => updateConfig({ voiceEnabled: !config.voiceEnabled })}
            ariaLabel="Voz de retroalimentación"
            className={styles.voiceCard}
          >
            <span className={styles.missionDot} aria-hidden="true"></span>
            <span>{config.voiceEnabled ? "Voz activada" : "Voz desactivada"}</span>
          </SelectableCard>
        </section>

        {/* Botón Guardar */}
        <div className={styles.saveContainer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      <div className={`${styles.feedbackContainer} ${feedbackMsg ? styles.show : ""}`}>
        {feedbackMsg}
      </div>

      {/* Confetti Animation Layer */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                left: `${Math.random() * 100}vw`,
                backgroundColor: ["#FFC700", "#FF6B6B", "#6BCB77", "#4D96FF", "#9B51E0"][
                  Math.floor(Math.random() * 5)
                ],
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </>
  );
}
