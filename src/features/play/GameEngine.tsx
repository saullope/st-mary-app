"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './game.module.css';
import confetti from 'canvas-confetti';
import { FaClock, FaStar, FaTrophy, FaArrowRight, FaBookOpen } from 'react-icons/fa6';
import MultimediaDisplay from "@/components/activity/MultimediaDisplay";
import { DEFAULT_POINTS, DEFAULT_TIME_LIMIT_MS, answerPoints, readSpeedBonus } from "@/lib/play/scoring";
import { evaluateBadges, evaluateMissions, evaluateLessonBadges, evaluateLessonMissions, GameplayStats, LessonProgressStats } from "@/features/gamification/achievementRules";
import { usePlaySession } from "./usePlaySession";
import { postPlay } from "./playApi";
import { PlayScreen, ReadyCard, GameSummary } from "./PlayScreens";
import { useTranslations } from "next-intl";

// Debe coincidir con ACTIVITY_TYPE_MAP en src/lib/activity-helpers.ts
const TIPO_LUDILECCION = 4;
const READING_RESOURCE_TYPES = ["PDF", "WORD", "POWERPOINT"];

interface GameEngineProps {
    sesion: any;
    /** Modo docente: sin sessionStorage, sin llamadas a /api/play/*, no navega a /play */
    previewMode?: boolean;
    /** Usado en previewMode para volver al editor en vez de ir a /play */
    onExit?: () => void;
    /** Nombre a mostrar en la pantalla de bienvenida durante previewMode */
    previewName?: string;
}

export const GameEngine = ({ sesion, previewMode = false, onExit, previewName }: GameEngineProps) => {
    const [gameState, setGameState] = useState<'READY' | 'COUNTDOWN' | 'PLAYING' | 'SLIDE' | 'FEEDBACK' | 'SUMMARY'>('READY');
    const [countdown, setCountdown] = useState(3);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
    const {
        config, participant, backgroundImage, selectedBadges, selectedMissions, speak,
        achievementQueue, awardedBadgesRef, awardedMissionsRef, recordBadges, announceMissions,
    } = usePlaySession({ sesion, previewMode, previewName });
    const t = useTranslations("Play.game");

    const questions = sesion.LUDI_ACTIVIDAD.preguntas || [];
    // Las diapositivas de contenido no cuentan en el progreso "n / total".
    const totalQuestions = questions.filter((q: any) => !q.esContenido).length;
    // En LudiLección todos los items son bloques de contenido y los logros se ganan por completarlos.
    const isLesson = Number(sesion.LUDI_ACTIVIDAD.tipoActividadId) === TIPO_LUDILECCION;

    // Stats corrientes del intento, usados por el motor de reglas de
    // insignias/misiones (achievementRules.ts). En refs porque deben
    // reflejar el valor real en el momento de evaluar, no el de un cierre
    // de React potencialmente desactualizado (p. ej. dentro del setTimeout
    // de auto-avance).
    const streakRef = useRef(0);
    const totalCorrectRef = useRef(0);
    const totalAnsweredRef = useRef(0);
    const totalScoreRef = useRef(0);
    const totalAnswerTimeMsRef = useRef(0);
    const hasFailedOnceRef = useRef(false);
    const blockShownAtRef = useRef(0);
    const blockTimesMsRef = useRef<number[]>([]);
    const readingBlockIndexesRef = useRef<number[]>([]);

    // Referencia al timeout de auto-avance, para poder cancelarlo si el
    // componente se desmonta antes de que se cumplan los 3 segundos
    // (evita setState sobre un componente ya desmontado y un finishGame()
    // disparado fuera de lugar).
    const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        return () => {
            if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
        };
    }, []);

    // 2. Countdown Logic
    useEffect(() => {
        if (gameState === 'COUNTDOWN') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setGameState('PLAYING');
                startQuestion(0);
            }
        }
    }, [gameState, countdown]);

    // 3. Question Timer Logic
    useEffect(() => {
        if (gameState === 'PLAYING' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (gameState === 'PLAYING' && timeLeft === 0) {
            handleAnswer(null); // Time out
        }
    }, [gameState, timeLeft]);

    const startQuestion = (index: number) => {
        const question = questions[index];
        if (!question) {
            console.error("Question not found at index:", index);
            setGameState('SUMMARY');
            finishGame();
            return;
        }
        if (question.esContenido) {
            // Sin temporizador: el timer solo corre en PLAYING.
            blockShownAtRef.current = Date.now();
            setGameState('SLIDE');
            return;
        }
        const questionTime = question.tiempoLimiteMs ? question.tiempoLimiteMs / 1000 : (config.tiempoPreguntaMs / 1000 || 30);
        setTimeLeft(Math.floor(questionTime));
        setSelectedOptionId(null);
        setFeedback(null);
    };

    const handleAnswer = async (optionId: string | null) => {
        if (gameState !== 'PLAYING') return;

        setSelectedOptionId(optionId);
        const currentQuestion = questions[currentQuestionIndex];
        let isCorrect = false;
        let pointsEarned = 0;

        if (optionId) {
            const selectedOption = currentQuestion.opciones.find((o: any) => o.id.toString() === optionId);
            isCorrect = selectedOption?.esCorrecta || false;

            if (isCorrect) {
                // Mismo cálculo que el servidor (lib/play/scoring): aquí solo se muestra al instante.
                const totalTimeMs = currentQuestion.tiempoLimiteMs || config.tiempoPreguntaMs || DEFAULT_TIME_LIMIT_MS;
                pointsEarned = answerPoints({
                    correct: true,
                    basePoints: currentQuestion.puntaje || config.puntajeBase || DEFAULT_POINTS,
                    totalTimeMs,
                    elapsedMs: totalTimeMs - timeLeft * 1000,
                    speedBonus: readSpeedBonus(config.ajustesJson),
                });

                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }

        setScore(prev => prev + pointsEarned);
        setFeedback({ isCorrect, points: pointsEarned });
        setGameState('FEEDBACK');

        const timeLimitMs = currentQuestion.tiempoLimiteMs || config.tiempoPreguntaMs || 30000;
        const elapsedMs = timeLimitMs - (timeLeft * 1000);

        // Sync with server (background). El servidor recalcula por su cuenta
        // si la respuesta es correcta y cuántos puntos vale (ver
        // /api/play/submit-answer) - esto solo le avisa qué se contestó.
        if (!previewMode && participant) {
            try {
                await postPlay('/api/play/submit-answer', participant, {
                    preguntaId: currentQuestion.id,
                    opcionId: optionId,
                    tiempoMs: elapsedMs
                });
            } catch (err) {
                console.error("Failed to sync answer:", err);
            }
        }

        // Actualizar stats e insignias/misiones en vivo (solo las
        // seleccionadas por el docente, ver achievementRules.ts)
        totalAnsweredRef.current += 1;
        totalAnswerTimeMsRef.current += elapsedMs;
        totalScoreRef.current += pointsEarned;
        if (isCorrect) {
            streakRef.current += 1;
            totalCorrectRef.current += 1;
        } else {
            streakRef.current = 0;
            hasFailedOnceRef.current = true;
        }

        const hasMedia = Boolean(currentQuestion.preguntaRecursos && currentQuestion.preguntaRecursos.length > 0);
        const stats: GameplayStats = {
            timeLimitMs,
            streak: streakRef.current,
            totalCorrect: totalCorrectRef.current,
            totalAnswered: totalAnsweredRef.current,
            totalScore: totalScoreRef.current,
            hasFailedOnce: hasFailedOnceRef.current,
            lastAnswerCorrect: isCorrect,
            lastAnswerHadMedia: hasMedia,
            lastAnswerTimeMs: elapsedMs,
            avgAnswerTimeMs: 0,
            isFinished: false,
        };
        recordBadges(evaluateBadges(selectedBadges, awardedBadgesRef.current, stats));
        announceMissions(evaluateMissions(selectedMissions, awardedMissionsRef.current, stats));

        // Auto-advance after 3 seconds
        if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
        advanceTimeoutRef.current = setTimeout(() => advanceFrom(currentQuestionIndex), 3000);
    };

    // Registra el bloque terminado y evalúa los logros de lección antes de avanzar.
    const completeLessonBlock = (index: number) => {
        const block = questions[index];
        const recursoTipo = String(block.preguntaRecursos?.[0]?.recurso?.tipo?.nombre || '').toUpperCase();
        const isReading = !block.preguntaRecursos?.length || READING_RESOURCE_TYPES.includes(recursoTipo);
        if (isReading) readingBlockIndexesRef.current.push(blockTimesMsRef.current.length);
        blockTimesMsRef.current.push(Date.now() - blockShownAtRef.current);

        const stats: LessonProgressStats = {
            totalBlocks: questions.length,
            blocksCompleted: blockTimesMsRef.current.length,
            blockTimesMs: blockTimesMsRef.current,
            readingBlockIndexes: readingBlockIndexesRef.current,
            isFinished: index >= questions.length - 1,
        };
        announceMissions(evaluateLessonMissions(selectedMissions, awardedMissionsRef.current, stats));
        recordBadges(evaluateLessonBadges(selectedBadges, awardedBadgesRef.current, stats));
    };

    const handleContinue = () => {
        if (isLesson) completeLessonBlock(currentQuestionIndex);
        advanceFrom(currentQuestionIndex);
    };

    const advanceFrom = (index: number) => {
        if (index < questions.length - 1) {
            setCurrentQuestionIndex(index + 1);
            setGameState('PLAYING');
            startQuestion(index + 1);
        } else {
            setGameState('SUMMARY');
            finishGame();
        }
    };

    const finishGame = async () => {
        if (!isLesson) recordFinalQuizBadges();
        if (previewMode) return;
        try {
            // El puntaje final ya vive en el servidor: submit-answer lo va
            // incrementando pregunta a pregunta de forma autoritativa. Este
            // llamado solo marca al participante como completado.
            if (participant) await postPlay('/api/play/finish', participant);
        } catch (err) {
            console.error("Failed to finish game:", err);
        }
    };

    const recordFinalQuizBadges = () => {
        // Insignias que solo se evalúan "al finalizar" (ver achievementRules.ts)
        const avgAnswerTimeMs = totalAnsweredRef.current > 0
            ? totalAnswerTimeMsRef.current / totalAnsweredRef.current
            : 0;
        const finalStats: GameplayStats = {
            timeLimitMs: config.tiempoPreguntaMs || 30000,
            streak: streakRef.current,
            totalCorrect: totalCorrectRef.current,
            totalAnswered: totalAnsweredRef.current,
            totalScore: totalScoreRef.current,
            hasFailedOnce: hasFailedOnceRef.current,
            lastAnswerCorrect: false,
            lastAnswerHadMedia: false,
            lastAnswerTimeMs: 0,
            avgAnswerTimeMs,
            isFinished: true,
        };
        recordBadges(evaluateBadges(selectedBadges, awardedBadgesRef.current, finalStats));
    };

    // Render logic
    if (gameState === 'READY') {
        return (
            <PlayScreen backgroundImage={backgroundImage}>
                <ReadyCard name={participant?.name} onStart={() => setGameState('COUNTDOWN')} />
            </PlayScreen>
        );
    }

    if (gameState === 'COUNTDOWN') {
        return (
            <PlayScreen backgroundImage={backgroundImage}>
                <div className={styles.countdownValue}>{countdown > 0 ? countdown : t('go')}</div>
            </PlayScreen>
        );
    }

    if (gameState === 'SUMMARY') {
        return (
            <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
                <div className={styles.centerCard}>
                    <GameSummary
                        missionCodes={Array.from(awardedMissionsRef.current)}
                        badgeCodes={Array.from(awardedBadgesRef.current)}
                        onReveal={speak}
                        sesion={sesion}
                        participant={participant}
                        previewMode={previewMode}
                        onExit={onExit}
                    >
                        <FaTrophy className={styles.trophyIcon} aria-hidden="true" />
                        <h1 className={styles.summaryTitle}>{isLesson ? t('lessonCompleted') : t('greatJob')}</h1>
                        {!isLesson && <p className={styles.summaryScore}>{t.rich('finalScore', { score, span: (chunks) => <span>{chunks}</span> })}</p>}
                    </GameSummary>
                </div>
            </PlayScreen>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
        return (
            <PlayScreen backgroundImage={backgroundImage}>
                <div className={styles.centerCard}>
                    <h1 className={styles.readyTitle}>{t('loading')}</h1>
                </div>
            </PlayScreen>
        );
    }

    const questionNumber = questions
        .slice(0, currentQuestionIndex + 1)
        .filter((q: any) => !q.esContenido).length;

    if (gameState === 'SLIDE') {
        const recurso = currentQuestion.preguntaRecursos?.[0]?.recurso;
        return (
            <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
                <div className={styles.hud}>
                    <div className={styles.hudItem}>
                        <FaBookOpen aria-hidden="true" /> {isLesson ? t('blockProgress', { current: currentQuestionIndex + 1, total: questions.length }) : t('slide')}
                    </div>
                    {!isLesson && (
                        <div className={styles.hudItem}>
                            <FaStar aria-hidden="true" /> {t('points', { score })}
                        </div>
                    )}
                </div>

                <div className={styles.questionArea}>
                    <section className={styles.slideCard} aria-labelledby={currentQuestion.enunciado ? 'slide-title' : undefined}>
                        {currentQuestion.enunciado && (
                            <h2 id="slide-title" className={styles.slideTitle}>{currentQuestion.enunciado}</h2>
                        )}
                        {recurso ? (
                            <MultimediaDisplay url={recurso.url} type={recurso.tipo?.nombre || 'PRESENTACION'} width={960} maxHeight="min(60vh, 560px)" />
                        ) : currentQuestion.contenidoTexto ? (
                            <div className={styles.readingBody}>
                                {String(currentQuestion.contenidoTexto).split(/\n{2,}/).map((paragraph: string, i: number) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        ) : null}
                        <button
                            type="button"
                            className={`${styles.bigStartBtn} ${styles.slideContinueBtn}`}
                            onClick={handleContinue}
                        >
                            {isLesson && currentQuestionIndex === questions.length - 1 ? t('finishLesson') : t('continue')} <FaArrowRight aria-hidden="true" />
                        </button>
                    </section>
                </div>
            </PlayScreen>
        );
    }

    return (
        <PlayScreen backgroundImage={backgroundImage} achievementQueue={achievementQueue}>
            {/* HUD */}
            <div className={styles.hud}>
                <div className={styles.hudItem} aria-label={t('timeLeft', { seconds: timeLeft })}>
                    <FaClock aria-hidden="true" /> {timeLeft}s
                </div>
                <div className={styles.hudItem}>
                    <FaStar aria-hidden="true" /> {t('points', { score })}
                </div>
                <div className={styles.hudItem} aria-label={t('questionProgress', { current: questionNumber, total: totalQuestions })}>
                    {questionNumber} / {totalQuestions}
                </div>
            </div>

            {/* Question Area */}
            <div className={styles.questionArea}>
                <div className={styles.questionCard}>
                    <h2 className={styles.questionText}>{currentQuestion.enunciado}</h2>

                    {/* Multimedia Display */}
                    {currentQuestion.preguntaRecursos && currentQuestion.preguntaRecursos.length > 0 && (
                        <div className="d-flex justify-content-center mt-4">
                            <MultimediaDisplay
                                url={currentQuestion.preguntaRecursos[0].recurso.url}
                                type={currentQuestion.preguntaRecursos[0].recurso.tipo?.nombre || "IMAGEN"}
                                width={500}
                                // La pregunta y las respuestas deben caber juntas en la pantalla.
                                maxHeight="min(34vh, 320px)"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.optionsGrid}>
                    {currentQuestion.opciones.map((opcion: any, idx: number) => {
                        const imageUrl: string | undefined = opcion.opcionRecursos?.[0]?.recurso?.url;
                        return (
                        <button
                            key={opcion.id.toString()}
                            className={`
                                ${styles.optionBtn}
                                ${selectedOptionId === opcion.id.toString() ? styles.selected : ''}
                                ${gameState === 'FEEDBACK' && opcion.esCorrecta ? styles.correct : ''}
                                ${gameState === 'FEEDBACK' && selectedOptionId === opcion.id.toString() && !opcion.esCorrecta ? styles.incorrect : ''}
                            `}
                            onClick={() => handleAnswer(opcion.id.toString())}
                            disabled={gameState === 'FEEDBACK'}
                        >
                            <span className={styles.optionSymbol} aria-hidden="true">{['🔺', '🔷', '🟢', '🟪'][idx % 4]}</span>
                            {imageUrl && (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={imageUrl} alt="" className={styles.optionImage} />
                            )}
                            <span className={styles.optionText}>
                                {/* En Verdadero/Falso la BD guarda el texto en español: se muestra por posición en el idioma activo. */}
                                {sesion.LUDI_ACTIVIDAD.tipoActividadId === 2 ? (opcion.indice === 1 ? t('true') : t('false')) : opcion.texto}
                            </span>
                        </button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback Overlay */}
            {gameState === 'FEEDBACK' && (
                <div className={`${styles.feedbackToast} ${feedback?.isCorrect ? styles.toastSuccess : styles.toastError}`} role="status">
                    {feedback?.isCorrect ? (
                        <>{t('correct', { points: feedback.points })}</>
                    ) : (
                        <>{t('incorrect')}</>
                    )}
                </div>
            )}
        </PlayScreen>
    );
};
