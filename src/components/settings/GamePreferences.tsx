'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { FaGamepad, FaUsers } from 'react-icons/fa';
import styles from './Settings.module.css';

export const GamePreferences = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    const [defaultTimeLimitMs, setDefaultTimeLimitMs] = useState<number>(30000);
    const [defaultPoints, setDefaultPoints] = useState<number>(10);
    const [defaultVoiceEnabled, setDefaultVoiceEnabled] = useState<boolean>(true);
    const [defaultIsPublic, setDefaultIsPublic] = useState<boolean>(false);
    
    // New Settings
    const [enableStudentFeedback, setEnableStudentFeedback] = useState<boolean>(true);
    const [enableTeacherEvaluation, setEnableTeacherEvaluation] = useState<boolean>(true);

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const res = await fetch('/api/user/config');
                if (res.ok) {
                    const data = await res.json();
                    if (data && typeof data.defaultTimeLimitMs === 'number') {
                        setDefaultTimeLimitMs(data.defaultTimeLimitMs);
                        setDefaultPoints(data.defaultPoints);
                        setDefaultVoiceEnabled(data.defaultVoiceEnabled);
                        setDefaultIsPublic(data.defaultIsPublic);
                        
                        if (data.enableStudentFeedback !== undefined) {
                            setEnableStudentFeedback(data.enableStudentFeedback);
                        }
                        if (data.enableTeacherEvaluation !== undefined) {
                            setEnableTeacherEvaluation(data.enableTeacherEvaluation);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching preferences", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const showMessage = (type: 'success' | 'danger', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSavePreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            const res = await fetch('/api/user/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    defaultTimeLimitMs,
                    defaultPoints,
                    defaultVoiceEnabled,
                    defaultIsPublic,
                    enableStudentFeedback,
                    enableTeacherEvaluation
                })
            });

            if (res.ok) {
                showMessage('success', 'Preferencias guardadas exitosamente.');
            } else {
                showMessage('danger', 'Ocurrió un error al guardar tus preferencias.');
            }
        } catch (error: any) {
            console.error(error);
            showMessage('danger', `Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Preferencias de Juego y Evaluaciones</h2>
            <p className={styles.subtitle}>Configura los valores por defecto al crear nuevas actividades y reportes.</p>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <Form onSubmit={handleSavePreferences}>
                <div className="row g-4 mb-4">
                    <div className="col-12 col-xl-6">
                        <Card className={`${styles.card} h-100`}>
                            <Card.Body>
                                <h5 className={styles.cardTitle}><FaGamepad className="me-2" /> Gamificación Predeterminada</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>Tiempo por pregunta por defecto (Segundos)</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="10"
                                        max="300"
                                        value={defaultTimeLimitMs / 1000} 
                                        onChange={(e) => setDefaultTimeLimitMs(Number(e.target.value) * 1000)}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Tiempo límite base cada vez que crees una actividad.
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>Puntaje por respuesta correcta</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="1"
                                        max="5000"
                                        value={defaultPoints} 
                                        onChange={(e) => setDefaultPoints(Number(e.target.value))}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Puntos predeterminados al acertar.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="voice-enabled-switch"
                                        label="Activar narración por voz por defecto"
                                        checked={defaultVoiceEnabled}
                                        onChange={(e) => setDefaultVoiceEnabled(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        Si está activo, los juegos leerán en voz alta los enunciados.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="public-activity-switch"
                                        label="Hacer mis juegos públicos por defecto"
                                        checked={defaultIsPublic}
                                        onChange={(e) => setDefaultIsPublic(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        Si está activo, otros educadores podrán ver y usar tus actividades en la comunidad.
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-12 col-xl-6">
                        <Card className={`${styles.card} h-100`}>
                            <Card.Body>
                                <h5 className={styles.cardTitle}><FaUsers className="me-2" /> Evaluaciones y Feedback</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="student-feedback-switch"
                                        label="Habilitar retroalimentación del estudiante"
                                        checked={enableStudentFeedback}
                                        onChange={(e) => setEnableStudentFeedback(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        Muestra una escala de 5 emojis al final del juego para que el estudiante evalúe la actividad.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="teacher-evaluation-switch"
                                        label="Habilitar evaluación docente (Reportes)"
                                        checked={enableTeacherEvaluation}
                                        onChange={(e) => setEnableTeacherEvaluation(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        Muestra un selector de "Utilidad por Grado" en tus reportes para medir la efectividad de la sesión.
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

                <Button 
                    variant="primary" 
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 fw-bold"
                >
                    {saving ? <Spinner size="sm" /> : 'Guardar Preferencias'}
                </Button>
            </Form>
        </div>
    );
};