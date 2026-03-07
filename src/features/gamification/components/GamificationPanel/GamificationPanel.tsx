"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./GamificationPanel.module.css";
import { useActivityEditor } from "@/context/ActivityEditorContext";

// Definición de tipos para las misiones
type Mission = {
  id: string;
  text: string;
  studentText: string;
};

type MissionsByGrade = {
  [key: number]: Mission[];
};

// Misiones por grado (hardcoded por ahora, podría venir de props o DB)
const MISIONES_POR_GRADO: MissionsByGrade = {
  1: [
    { id: "1-3-en-raya", text: "Responde 3 preguntas correctas seguidas", studentText: "¡Felicitaciones! Lograste responder 3 preguntas seguidas correctamente." },
    { id: "1-rapidez-15s", text: "Responde rápido en menos de 15 segundos", studentText: "¡Genial! Respondiste rápido en menos de 15 segundos." },
    { id: "1-20-puntos", text: "Acumula 20 puntos en total", studentText: "¡Increíble! Acumulaste 20 puntos." },
  ],
  2: [
    { id: "2-4-en-raya", text: "Responde 4 preguntas correctas seguidas", studentText: "¡Excelente! Respondiste 4 preguntas seguidas correctamente." },
    { id: "2-rapidez-12s", text: "Responde rápido en menos de 12 segundos", studentText: "¡Genial! Respondiste rápido en menos de 12 segundos." },
    { id: "2-35-puntos", text: "Acumula 30 puntos en total", studentText: "¡Bravo! Acumulaste 30 puntos." },
  ],
  3: [
    { id: "3-5-en-raya", text: "Responde 5 preguntas correctas seguidas", studentText: "¡Increíble! Respondiste 5 preguntas seguidas correctamente." },
    { id: "3-rapidez-10s", text: "Responde rápido en menos de 10 segundos", studentText: "¡Genial! Respondiste rápido en menos de 10 segundos." },
    { id: "3-45-puntos", text: "Acumula 40 puntos en total", studentText: "¡Fantástico! Acumulaste 40 puntos." },
  ],
};

const INSIGNIAS = [
  { id: "sabio", name: "Sabio", phrase: "¡Increíble! Respondiste muy bien", desc: "Para estudiantes que responden correctamente.", color: "#5FC4D0", img: "/images/panelludico/sabio.png" },
  { id: "veloz", name: "Veloz", phrase: "¡Eso fue rapidísimo! Eres muy veloz", desc: "Para estudiantes que responden rápidamente.", color: "#9B51E0", img: "/images/panelludico/veloz.png" },
  { id: "valiente", name: "Valiente", phrase: "No te rendiste y seguiste intentando", desc: "Para quienes, aunque fallen, siguen intentando.", color: "#FFDA5F", img: "/images/panelludico/valiente.png" },
  { id: "mente-creativa", name: "Mente Creativa", phrase: "¡Qué creativo! Tus ideas son muy especiales", desc: "Para quienes aportan ideas originales y creativas.", color: "#FF7F7F", img: "/images/panelludico/mente-creativa.png" },
  { id: "agil", name: "Ágil", phrase: "Encontraste la respuesta con rapidez e ingenio", desc: "Para estudiantes que resuelven con destreza y precisión.", color: "#6FCF97", img: "/images/panelludico/agil.png" },
  { id: "detective", name: "Detective", phrase: "¡Eres todo un Detective! Descubriste la respuesta correcta.", desc: "Para quienes descubren la respuesta correcta.", color: "#A567B6", img: "/images/panelludico/detective.png" },
];

export default function GamificationPanel({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  trigger
}: {
  isOpen?: boolean;
  onToggle?: () => void;
  trigger?: React.ReactNode;
}) {
  const { state, updateConfig } = useActivityEditor();
  const { config } = state;

  const [localIsOpen, setLocalIsOpen] = useState(false);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : localIsOpen;
  
  const togglePanel = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setLocalIsOpen(!localIsOpen);
    }
  };
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Referencia para la voz sintetizada
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Cargar voces al montar
  useEffect(() => {
    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.name.includes("Sofía") || v.name.includes("Sofia")) ||
        voices.find((v) => /es(-|_)US|es(-|_)MX/.test(v.lang)) ||
        voices[0] ||
        null;
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
  }, []);

  // Función para hablar
  const speak = (text: string) => {
    if (!config.voiceEnabled || !window.speechSynthesis) return;
    
    // Cancelar cualquier audio previo para evitar superposiciones
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
      utterance.rate = 1.2;
      utterance.pitch = 1.1;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig({ gradeId: Number(e.target.value) });
  };

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

  const handleMissionToggle = (text: string) => {
     // Solo feedback auditivo/visual simple, no guardamos estado de misiones seleccionadas en este ejemplo básico
     triggerConfetti();
     if (config.voiceEnabled) speak(`Misión seleccionada: ${text}`);
     
     // Si quisiéramos guardar las misiones:
     /*
     const currentMissions = new Set(config.selectedMissions);
     if (currentMissions.has(text)) currentMissions.delete(text);
     else currentMissions.add(text);
     updateConfig({ selectedMissions: Array.from(currentMissions) });
     */
  };

  const handleSave = () => {
    if (!config.timeLimit || config.timeLimit <= 0) {
      showFeedback("Por favor, ingresa un valor válido de tiempo.");
      return;
    }
    if (!config.pointsPerCorrect || config.pointsPerCorrect <= 0) {
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

  // Usamos un estado para saber si el componente ya se montó en el cliente
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Si no está montado, no renderizamos nada (evita errores de hidratación con portales)
  if (!mounted) return null;

  // Renderizamos el contenido usando un Portal al body
  return createPortal(
    <>
      {/* Botón abrir panel */}
      {trigger !== null ? (
        trigger || (
          <button
            className={`${styles.togglePanel} ${isOpen ? styles.hidden : ""}`}
            onClick={togglePanel}
            title="Abrir Panel Lúdico"
          >
            ⭐ Panel Lúdico
          </button>
        )
      ) : null}

      {/* Botón cerrar panel */}
      {isOpen && (
        <button
          className={styles.returnButton}
          onClick={togglePanel}
          title="Cerrar Panel"
          aria-label="Cerrar panel"
        >
          ⬅️
        </button>
      )}

      {/* Panel Lateral */}
      <div
        className={`${styles.gamificationPanel} ${isOpen ? styles.panelOpen : ""}`}
        role="region"
        aria-label="Panel de configuración lúdica"
      >
        {/* Decoración Superior */}
        <div className={styles.panelPuntosArriba}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <h3 className={styles.headerGlow}>Configuración Lúdica</h3>

        {/* Selección de Grado */}
        <label htmlFor="grado" className={styles.label}>
          🎓 Selecciona el grado:
        </label>
        <select
          id="grado"
          value={config.gradeId}
          onChange={handleGradeChange}
          className={styles.select}
        >
          <option value="1">1° Grado</option>
          <option value="2">2° Grado</option>
          <option value="3">3° Grado</option>
        </select>

        {/* Configuración de Tiempo */}
        <label htmlFor="tiempo" className={styles.label}>
          ⏱️ Tiempo por actividad (segundos):
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

        {/* Configuración de Puntos */}
        <label htmlFor="puntos" className={styles.label}>
          🏅 Puntos por respuesta correcta:
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
        <div className={styles.desc}>
          Define los puntos que el estudiante gana por cada respuesta correcta.
        </div>

        {/* Insignias */}
        <fieldset className={styles.fieldset} aria-label="Insignias disponibles">
          <legend className={styles.legend}>🏆 Insignias de recompensa</legend>
          <div className={styles.insigniasContainer}>
            {INSIGNIAS.map((badge) => (
              <label key={badge.id} className={styles.checkboxLabel} htmlFor={`insignia-${badge.id}`}>
                <input
                  type="checkbox"
                  id={`insignia-${badge.id}`}
                  checked={config.selectedBadges.includes(badge.id)}
                  onChange={() => handleBadgeToggle(badge.id, badge.phrase, badge.name)}
                />
                <div className={styles.insignia} style={{ "--color-bg": badge.color } as React.CSSProperties}>
                  {/* Nota: Usamos <img> estándar porque las rutas son relativas a public/ */}
                  <img src={badge.img} alt={badge.name} />
                  <span>{badge.name}</span>
                  <p className={styles.insigniaDescription}>{badge.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Misiones */}
        <fieldset className={styles.fieldset} aria-label="Misiones y Desafíos configurables">
          <legend className={styles.legend}>🎮 Misiones y Desafíos</legend>
          <div id="misiones-container">
            {MISIONES_POR_GRADO[config.gradeId]?.map((mision) => (
              <label key={mision.id} className={styles.checkboxLabel}>
                <input 
                    type="checkbox" 
                    onChange={(e) => {
                        if(e.target.checked) handleMissionToggle(mision.studentText);
                    }}
                />
                {mision.text}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Toggle Voz */}
        <div className={styles.voiceToggleContainer}>
          <input
            type="checkbox"
            id="voice-toggle"
            checked={config.voiceEnabled}
            onChange={(e) => updateConfig({ voiceEnabled: e.target.checked })}
          />
          <label htmlFor="voice-toggle" style={{ cursor: "pointer" }}>
            🔊 Voz activada
          </label>
        </div>

        {/* Botón Guardar */}
        <div className={styles.saveContainer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            Guardar Configuración
          </button>
        </div>

        {/* Decoración Inferior */}
        <div className={styles.panelPuntosAbajo}>
          <div></div>
          <div></div>
          <div></div>
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
    </>,
    document.body
  );
}
