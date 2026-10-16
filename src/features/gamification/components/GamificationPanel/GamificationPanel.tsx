"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "react-bootstrap";
import { FaExpand } from "react-icons/fa6";
import { SelectableCard } from "@/features/gamification/components/SelectableCard/SelectableCard";
import { DEFAULT_POINTS, DEFAULT_TIME_LIMIT_MS, answerPoints } from "@/lib/play/scoring";
import styles from "./GamificationPanel.module.css";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { badgesFor, catalogKeyForActivity, missionsFor, type BadgeDef, type MissionDef } from "@/features/gamification/catalog";
import { useAchievementCatalog } from "@/features/gamification/AchievementCatalogContext";
import { useAchievementText } from "@/features/gamification/useAchievementText";
import { BadgeArt } from "@/features/gamification/components/BadgeArt";
import { useSelectedGrade } from "@/hooks/useSelectedGrade";
import { useTranslations } from "next-intl";

/** Los textos del panel cambian según cómo se gana en cada tipo de actividad (GamificationPanel.copy.*). */
const COPY_KEYS = new Set(["ludileccion", "ludiform", "ludimemory"]);

/** Panel Lúdico integrado en la columna derecha de cada editor (ver EditorGamificationColumn). */
export default function GamificationPanel() {
  const { state, updateConfig } = useActivityEditor();
  const { config, activityType } = state;
  // Solo LudiQuiz y Verdadero/Falso se juegan contra el reloj; las lecciones tampoco dan puntos.
  const hasTimer = activityType === "ludiquiz" || activityType === "trueorfalse";
  const hasPoints = activityType !== "ludileccion";
  const isMemory = activityType === "ludimemory";
  // Las actividades guardadas antes de este ajuste lo tenían siempre activo.
  const speedBonus = config.speedBonus ?? true;
  // El ejemplo usa la misma fórmula que el servidor, con los puntos y el tiempo puestos.
  const scoringExample = useMemo(() => {
    const basePoints = config.pointsPerCorrect > 0 ? config.pointsPerCorrect : DEFAULT_POINTS;
    const totalTimeMs = config.timeLimit > 0 ? config.timeLimit * 1000 : DEFAULT_TIME_LIMIT_MS;
    const at = (elapsedMs: number) => answerPoints({ correct: true, basePoints, totalTimeMs, elapsedMs, speedBonus: true });
    return { max: at(0), mid: at(totalTimeMs / 2), min: at(totalTimeMs) };
  }, [config.pointsPerCorrect, config.timeLimit]);
  const t = useTranslations("GamificationPanel");
  const copyKey = activityType && COPY_KEYS.has(activityType) ? activityType : "default";
  const copy = (field: "points" | "badges") => t(`copy.${copyKey}.${field}`);
  const catalog = useAchievementCatalog();
  const achievementText = useAchievementText();
  const catalogKey = catalogKeyForActivity(activityType);
  const badges = useMemo(() => badgesFor(catalog, catalogKey), [catalog, catalogKey]);
  const missions = useMemo(() => missionsFor(catalog, catalogKey, config.gradeId), [catalog, catalogKey, config.gradeId]);

  // Una actividad guardada antes de tener catálogo propio puede traer insignias de otro tipo.
  useEffect(() => {
    // Sin catálogo cargado no se sabe qué es válido: no se toca la selección.
    if (!activityType || badges.length === 0) return;
    const valid = config.selectedBadges.filter((code) => badges.some((b) => b.code === code));
    if (valid.length !== config.selectedBadges.length) updateConfig({ selectedBadges: valid });
  }, [activityType, badges, config.selectedBadges, updateConfig]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  const handleBadgeToggle = (badge: BadgeDef) => {
    const currentBadges = new Set(config.selectedBadges);
    if (currentBadges.has(badge.code)) {
      currentBadges.delete(badge.code);
    } else {
      currentBadges.add(badge.code);
      // Solo confeti: la voz es para el estudiante cuando gana el logro jugando.
      triggerConfetti();
    }
    updateConfig({ selectedBadges: Array.from(currentBadges) });
  };

  const handleMissionToggle = (mission: MissionDef) => {
    const missionId = mission.code;
    const currentMissions = new Set(config.selectedMissions || []);
    if (currentMissions.has(missionId)) {
      currentMissions.delete(missionId);
    } else {
      currentMissions.add(missionId);
      triggerConfetti();
    }
    updateConfig({ selectedMissions: Array.from(currentMissions) });
  };

  const handleSave = () => {
    if (hasTimer && (!config.timeLimit || config.timeLimit <= 0)) {
      showFeedback(t("invalidTime"));
      return;
    }
    if (hasPoints && (!config.pointsPerCorrect || config.pointsPerCorrect <= 0)) {
      showFeedback(t("invalidPoints"));
      return;
    }
    if (config.selectedBadges.length === 0) {
      showFeedback(t("selectBadge"));
      return;
    }

    // El estado ya está en el contexto del editor: guardar aquí solo confirma.
    showFeedback(t("saved"));
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2000);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000); // Duración de la animación
  };

  // El panel se dibuja en la columna y, ampliado, en un modal: los ids llevan el
  // ámbito para no repetirse, y los marcadores de la visita solo van en la columna.
  const renderSections = (scope: "panel" | "expanded") => {
    const tour = (id: string) => (scope === "panel" ? id : undefined);
    return (
      <>
        {/* Configuración general */}
        {(hasTimer || hasPoints) && (
        <section className={styles.sectionCard} aria-labelledby={`${scope}-general-title`} data-tour={tour("panel-general")}>
          <h4 id={`${scope}-general-title`} className={styles.sectionTitle}>{t("general")}</h4>
          <div className={styles.configGrid}>
            {hasTimer && (
            <div>
              <label htmlFor={`${scope}-tiempo`} className={styles.label}>
                {t("timeLabel")}
              </label>
              <input
                type="number"
                id={`${scope}-tiempo`}
                min="10"
                max="300"
                placeholder={t("timePlaceholder")}
                className={styles.inputNumber}
                value={config.timeLimit || ""}
                onChange={(e) => updateConfig({ timeLimit: Number(e.target.value) })}
              />
              <div className={styles.desc}>
                {t("timeHint")}
              </div>
            </div>
            )}

            {hasPoints && (
            <div>
              <label htmlFor={`${scope}-puntos`} className={styles.label}>
                {isMemory ? t("pointsPerPair") : hasTimer && speedBonus ? t("pointsPerAnswerMax") : t("pointsPerAnswer")}
              </label>
              <input
                type="number"
                id={`${scope}-puntos`}
                min="1"
                max="100"
                placeholder={t("pointsPlaceholder")}
                className={styles.inputNumber}
                value={config.pointsPerCorrect || ""}
                onChange={(e) => updateConfig({ pointsPerCorrect: Number(e.target.value) })}
              />
              <div className={styles.desc}>
                {hasTimer ? t("pointsScoringHint") : copy("points")}
              </div>
            </div>
            )}
          </div>

          {hasTimer && (
          <fieldset className={styles.scoring} data-tour={tour("panel-scoring")}>
            <legend className={styles.label}>{t("scoringTitle")}</legend>
            {([true, false] as const).map((mode) => {
              const id = `${scope}-scoring-${mode ? "speed" : "fixed"}`;
              return (
                <label key={id} htmlFor={id} className={styles.scoringOption} data-selected={speedBonus === mode || undefined}>
                  <input
                    type="radio"
                    id={id}
                    name={`${scope}-scoring`}
                    className={styles.scoringRadio}
                    checked={speedBonus === mode}
                    onChange={() => updateConfig({ speedBonus: mode })}
                    aria-describedby={`${id}-desc`}
                  />
                  <span>
                    <span className={styles.scoringName}>{mode ? t("scoringSpeedName") : t("scoringFixedName")}</span>
                    <span id={`${id}-desc`} className={styles.scoringDesc}>
                      {mode ? t("scoringSpeedDesc") : t("scoringFixedDesc")}{" "}
                      <span className={styles.scoringExample}>
                        {mode
                          ? t("scoringSpeedExample", scoringExample)
                          : t("scoringFixedExample", { points: scoringExample.max })}
                      </span>
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          )}
        </section>
        )}

        {/* Insignias */}
        <section className={styles.sectionCard} aria-labelledby={`${scope}-badges-title`} data-tour={tour("panel-badges")}>
          <h4 id={`${scope}-badges-title`} className={styles.sectionTitle}>{t("badgesTitle")}</h4>
          <p className={styles.sectionHint}>{copy("badges")}</p>
          <div className={styles.insigniasContainer}>
            {badges.map((badge) => {
              const text = achievementText.badge(badge);
              return (
                <SelectableCard
                  key={badge.code}
                  selected={config.selectedBadges.includes(badge.code)}
                  onToggle={() => handleBadgeToggle(badge)}
                  ariaLabel={t("badgeLabel", { name: text.name, description: text.description })}
                  className={styles.badgeCard}
                >
                  <BadgeArt badge={badge} size={72} className={styles.badgeImg} />
                  <span className={styles.badgeName}>{text.name}</span>
                  <p className={styles.badgeDescription}>{text.description}</p>
                </SelectableCard>
              );
            })}
          </div>
        </section>

        {/* Misiones */}
        <section className={styles.sectionCard} aria-labelledby={`${scope}-missions-title`} data-tour={tour("panel-missions")}>
          <h4 id={`${scope}-missions-title`} className={styles.sectionTitle}>{t("missionsTitle")}</h4>
          <p className={styles.sectionHint}>{t("missionsHint")}</p>
          <div className={styles.missionsGrid}>
            {missions.map((mision) => (
              <SelectableCard
                key={mision.code}
                selected={(config.selectedMissions || []).includes(mision.code)}
                onToggle={() => handleMissionToggle(mision)}
                ariaLabel={t("missionLabel", { text: achievementText.mission(mision).text })}
                className={styles.missionCard}
              >
                <span className={styles.missionDot} aria-hidden="true"></span>
                <span>{achievementText.mission(mision).text}</span>
              </SelectableCard>
            ))}
          </div>
        </section>

        {/* Toggle Voz */}
        <section className={styles.sectionCard} aria-label={t("accessibility")}>
          <SelectableCard
            selected={config.voiceEnabled}
            onToggle={() => updateConfig({ voiceEnabled: !config.voiceEnabled })}
            ariaLabel={t("voiceLabel")}
            className={styles.voiceCard}
          >
            <span className={styles.missionDot} aria-hidden="true"></span>
            <span>{config.voiceEnabled ? t("voiceOn") : t("voiceOff")}</span>
          </SelectableCard>
        </section>

        {/* Botón Guardar */}
        <div className={styles.saveContainer}>
          <button className={styles.saveBtn} onClick={handleSave}>
            {t("save")}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      <div
        id="sidebar-panel-ludico"
        data-tour="panel-ludico"
        className={`${styles.gamificationPanel} ${styles.embedded}`}
        role="region"
        aria-label={t("regionLabel")}
      >
        <div className={styles.header}>
          <h3 className={styles.headerGlow}>{t("title")}</h3>
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => setExpanded(true)}
            aria-label={t("expand")}
            title={t("expand")}
            aria-haspopup="dialog"
          >
            <FaExpand aria-hidden="true" />
          </button>
        </div>

        {renderSections("panel")}
      </div>

      <Modal show={expanded} onHide={() => setExpanded(false)} size="xl" centered scrollable aria-labelledby="gamification-expanded-title">
        <Modal.Header closeButton closeLabel={t("close")}>
          <Modal.Title id="gamification-expanded-title" as="h2" className={styles.expandedTitle}>
            {t("expandedTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={`${styles.embedded} ${styles.expanded}`}>
          {renderSections("expanded")}
        </Modal.Body>
      </Modal>

      {/* Feedback Toast */}
      <div className={`${styles.feedbackContainer} ${feedbackMsg ? styles.show : ""}`} role="status">
        {feedbackMsg}
      </div>

      {/* Confetti Animation Layer */}
      {showConfetti && (
        <div className={styles.confettiContainer} aria-hidden="true">
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
