"use client";

import React, { useState, useEffect } from 'react';
import styles from './game.module.css';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { FaClock, FaStar, FaTrophy } from 'react-icons/fa6';
import MultimediaDisplay from "@/components/activity/MultimediaDisplay";

interface GameEngineProps {
    sesion: any;
}

export const GameEngine = ({ sesion }: GameEngineProps) => {
    const router = useRouter();
    const [gameState, setGameState] = useState<'READY' | 'COUNTDOWN' | 'PLAYING' | 'FEEDBACK' | 'SUMMARY'>('READY');
    const [countdown, setCountdown] = useState(3);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; points: number } | null>(null);
    const [participantData, setParticipantData] = useState<any>(null);

    const questions = sesion.LUDI_ACTIVIDAD.preguntas || [];
    const config = sesion.LUDI_ACTIVIDAD.config || {};
    
    // Parse settings and ensure background image is handled correctly
    let settings: any = {};
    try {
        settings = config.ajustesJson ? JSON.parse(config.ajustesJson) : {};
    } catch (e) {
        console.error("Error parsing ajustesJson", e);
    }
    
    const backgroundImage = settings.backgroundImage || '/images/theme/tema1.jpg';

    // 1. Initial Setup
    useEffect(() => {
        const localData = sessionStorage.getItem(`ludi_participant_${sesion.id}`);
        if (!localData) {
            router.push('/play');
            return;
        }
        setParticipantData(JSON.parse(localData));
    }, [router, sesion.id]);

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
            isCorrect = selectedOption?.esCorrecta || selectedOption?.es_correcta || false;
            
            if (isCorrect) {
                // Calculate points based on time remaining
                const basePoints = currentQuestion.puntaje || config.puntajeBase || 1000;
                const timeFactor = timeLeft / (currentQuestion.tiempoLimiteMs / 1000 || config.tiempoPreguntaMs / 1000 || 30);
                pointsEarned = Math.round(basePoints * (0.5 + 0.5 * timeFactor));
                
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

        // Sync with server (background)
        try {
            await fetch('/api/play/submit-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participanteId: participantData.id,
                    preguntaId: currentQuestion.id,
                    opcionId: optionId,
                    esCorrecta: isCorrect,
                    tiempoMs: (currentQuestion.tiempoLimiteMs || config.tiempoPreguntaMs || 30000) - (timeLeft * 1000),
                    puntaje: pointsEarned
                })
            });
        } catch (err) {
            console.error("Failed to sync answer:", err);
        }

        // Auto-advance after 3 seconds
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setGameState('PLAYING');
                startQuestion(currentQuestionIndex + 1);
            } else {
                setGameState('SUMMARY');
                finishGame();
            }
        }, 3000);
    };

    const finishGame = async () => {
        try {
            await fetch('/api/play/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    participanteId: participantData.id,
                    puntajeTotal: score
                })
            });
        } catch (err) {
            console.error("Failed to finish game:", err);
        }
    };

    // Render logic
    if (gameState === 'READY') {
        return (
            <div className={styles.gameWrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className={styles.overlay}></div>
                <div className={styles.centerCard}>
                    <h1 className={styles.readyTitle}>¿Estás listo, {participantData?.name}?</h1>
                    <button className={styles.bigStartBtn} onClick={() => setGameState('COUNTDOWN')}>
                        ¡SÍ, VAMOS!
                    </button>
                </div>
            </div>
        );
    }

    if (gameState === 'COUNTDOWN') {
        return (
            <div className={styles.gameWrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className={styles.overlay}></div>
                <div className={styles.countdownValue}>{countdown > 0 ? countdown : '¡YA!'}</div>
            </div>
        );
    }

    if (gameState === 'SUMMARY') {
        return (
            <div className={styles.gameWrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
                <div className={styles.overlay}></div>
                <div className={styles.centerCard}>
                    <FaTrophy className={styles.trophyIcon} />
                    <h1 className={styles.summaryTitle}>¡Increíble trabajo!</h1>
                    <p className={styles.summaryScore}>Puntaje Final: <span>{score}</span></p>
                    <button className={styles.backBtn} onClick={() => router.push('/play')}>
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className={styles.gameWrapper} style={{ backgroundImage: `url(${backgroundImage})` }}>
            <div className={styles.overlay}></div>
            
            {/* HUD */}
            <div className={styles.hud}>
                <div className={styles.hudItem}>
                    <FaClock /> {timeLeft}s
                </div>
                <div className={styles.hudItem}>
                    <FaStar /> {score} pts
                </div>
                <div className={styles.hudItem}>
                    {currentQuestionIndex + 1} / {questions.length}
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
                            />
                        </div>
                    )}
                </div>

                <div className={styles.optionsGrid}>
                    {currentQuestion.opciones.map((opcion: any, idx: number) => (
                        <button 
                            key={opcion.id.toString()}
                            className={`
                                ${styles.optionBtn} 
                                ${selectedOptionId === opcion.id.toString() ? styles.selected : ''}
                                ${gameState === 'FEEDBACK' && (opcion.esCorrecta || opcion.es_correcta) ? styles.correct : ''}
                                ${gameState === 'FEEDBACK' && selectedOptionId === opcion.id.toString() && !(opcion.esCorrecta || opcion.es_correcta) ? styles.incorrect : ''}
                            `}
                            onClick={() => handleAnswer(opcion.id.toString())}
                            disabled={gameState === 'FEEDBACK'}
                        >
                            <span className={styles.optionSymbol}>{['🔺', '🔷', '🟢', '🟪'][idx % 4]}</span>
                            {opcion.texto || (sesion.LUDI_ACTIVIDAD.tipoActividadId === 2 ? (opcion.indice === 1 ? 'Verdadero' : 'Falso') : '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Feedback Overlay */}
            {gameState === 'FEEDBACK' && (
                <div className={`${styles.feedbackToast} ${feedback?.isCorrect ? styles.toastSuccess : styles.toastError}`}>
                    {feedback?.isCorrect ? (
                        <>¡Correcto! +{feedback.points} pts</>
                    ) : (
                        <>¡Oh no! Sigue intentándolo</>
                    )}
                </div>
            )}
        </div>
    );
};
