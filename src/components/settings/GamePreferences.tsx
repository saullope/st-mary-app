'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { FaGamepad, FaUsers } from 'react-icons/fa';
import styles from './Settings.module.css';
import { useTranslations } from 'next-intl';

export const GamePreferences = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    const [defaultTimeLimitMs, setDefaultTimeLimitMs] = useState<number>(30000);
    const [defaultPoints, setDefaultPoints] = useState<number>(10);
    const [defaultVoiceEnabled, setDefaultVoiceEnabled] = useState<boolean>(true);
    const [defaultIsPublic, setDefaultIsPublic] = useState<boolean>(false);
    
    const t = useTranslations('GamePreferences');
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
                showMessage('success', t('saved'));
            } else {
                showMessage('danger', t('saveFailed'));
            }
        } catch (error) {
            console.error(error);
            showMessage('danger', t('saveFailed'));
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
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>

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
                                <h5 className={styles.cardTitle}><FaGamepad className="me-2" aria-hidden="true" /> {t('gamificationTitle')}</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>{t('timeLabel')}</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="10"
                                        max="300"
                                        value={defaultTimeLimitMs / 1000} 
                                        onChange={(e) => setDefaultTimeLimitMs(Number(e.target.value) * 1000)}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        {t('timeHint')}
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>{t('pointsLabel')}</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="1"
                                        max="5000"
                                        value={defaultPoints} 
                                        onChange={(e) => setDefaultPoints(Number(e.target.value))}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        {t('pointsHint')}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="voice-enabled-switch"
                                        label={t('voiceLabel')}
                                        checked={defaultVoiceEnabled}
                                        onChange={(e) => setDefaultVoiceEnabled(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        {t('voiceHint')}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="public-activity-switch"
                                        label={t('publicLabel')}
                                        checked={defaultIsPublic}
                                        onChange={(e) => setDefaultIsPublic(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        {t('publicHint')}
                                    </Form.Text>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </div>

                    <div className="col-12 col-xl-6">
                        <Card className={`${styles.card} h-100`}>
                            <Card.Body>
                                <h5 className={styles.cardTitle}><FaUsers className="me-2" aria-hidden="true" /> {t('evaluationTitle')}</h5>
                                
                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="student-feedback-switch"
                                        label={t('studentLabel')}
                                        checked={enableStudentFeedback}
                                        onChange={(e) => setEnableStudentFeedback(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        {t('studentHint')}
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Check 
                                        type="switch"
                                        id="teacher-evaluation-switch"
                                        label={t('teacherLabel')}
                                        checked={enableTeacherEvaluation}
                                        onChange={(e) => setEnableTeacherEvaluation(e.target.checked)}
                                    />
                                    <Form.Text className="text-muted">
                                        {t('teacherHint')}
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
                    {saving ? <Spinner size="sm" aria-label={t('saving')} /> : t('save')}
                </Button>
            </Form>
        </div>
    );
};