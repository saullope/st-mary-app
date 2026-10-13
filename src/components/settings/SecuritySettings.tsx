'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { auth } from '@/firebase/firebase';
import { updatePassword, sendPasswordResetEmail, User } from 'firebase/auth';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Settings.module.css';
import { useTranslations } from 'next-intl';

const MIN_PASSWORD_LENGTH = 8;

export const SecuritySettings = () => {
    const t = useTranslations('SecuritySettings');
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setEmail(currentUser.email || '');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const showMessage = (type: 'success' | 'danger', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            showMessage('danger', t('mismatch'));
            return;
        }

        // Mismo mínimo que el registro (SignUpForm).
        if (newPassword.length < MIN_PASSWORD_LENGTH) {
            showMessage('danger', t('tooShort', { min: MIN_PASSWORD_LENGTH }));
            return;
        }
        
        try {
            setUpdatingPassword(true);
            await updatePassword(user, newPassword);
            setNewPassword('');
            setConfirmPassword('');
            showMessage('success', t('updated'));
        } catch (error) {
            console.error(error);
            const code = (error as { code?: string }).code;
            showMessage('danger', code === 'auth/requires-recent-login' ? t('recentLogin') : t('updateFailed'));
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePasswordResetEmail = async () => {
        if (!email) return;
        try {
            setSendingEmail(true);
            await sendPasswordResetEmail(auth, email);
            showMessage('success', t('resetSent'));
        } catch (error) {
            console.error(error);
            showMessage('danger', t('emailFailed'));
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (!user) {
        return <Alert variant="warning">No hay usuario autenticado.</Alert>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>

            {message && (
                <Alert variant={message.type} className="mb-4" role={message.type === 'danger' ? 'alert' : 'status'}>
                    {message.text}
                </Alert>
            )}

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaLock className="me-2" aria-hidden="true" /> {t('changeTitle')}</h5>
                            
                            <Form onSubmit={handleUpdatePassword}>
                                <Form.Group className="mb-3" controlId="security-new-password">
                                    <Form.Label>{t('newPassword')}</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"} 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('minPlaceholder', { min: MIN_PASSWORD_LENGTH })}
                                        />
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                                            aria-pressed={showPassword}
                                        >
                                            {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="security-confirm-password">
                                    <Form.Label>{t('confirmPassword')}</Form.Label>
                                    <Form.Control 
                                        type={showPassword ? "text" : "password"} 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('confirmPlaceholder')}
                                    />
                                </Form.Group>

                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    disabled={updatingPassword || !newPassword || !confirmPassword}
                                >
                                    {updatingPassword ? <Spinner size="sm" aria-label={t('saving')} /> : t('changeButton')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaEnvelope className="me-2" aria-hidden="true" /> {t('recoveryTitle')}</h5>
                            
                            <p className="mb-3 text-muted">
                                {t.rich('recoveryHint', { email, strong: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            
                            <Button 
                                variant="outline-secondary" 
                                onClick={handlePasswordResetEmail}
                                disabled={sendingEmail}
                            >
                                {sendingEmail ? t('sending') : t('sendRecovery')}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};
