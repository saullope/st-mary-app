'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { auth } from '@/firebase/firebase';
import { updateProfile, sendEmailVerification, User } from 'firebase/auth';
import { FaUser } from 'react-icons/fa';
import styles from './Settings.module.css';
import { useTranslations } from 'next-intl';

export const PersonalInfo = () => {
    const t = useTranslations('PersonalInfo');
    const [user, setUser] = useState<User | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setDisplayName(currentUser.displayName || '');
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

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        try {
            setUpdatingProfile(true);
            await updateProfile(user, { displayName });
            showMessage('success', t('updated'));
        } catch (error) {
            console.error(error);
            showMessage('danger', t('updateFailed'));
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleSendVerification = async () => {
        if (!user) return;
        try {
            setSendingEmail(true);
            await sendEmailVerification(user);
            showMessage('success', t('verificationSent'));
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
                            <h5 className={styles.cardTitle}><FaUser className="me-2" aria-hidden="true" /> {t('profileTitle')}</h5>
                            <Form onSubmit={handleUpdateProfile}>
                                <Form.Group className="mb-3" controlId="profile-name">
                                    <Form.Label>{t('name')}</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={displayName} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder={t('namePlaceholder')}
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="profile-email">
                                    <Form.Label>{t('email')}</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={email} 
                                        disabled
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                        {t('emailHint')}
                                    </Form.Text>
                                </Form.Group>

                                {!user.emailVerified && (
                                    <div className="mb-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                        <p className="mb-2 text-warning-emphasis fw-bold">
                                            {t('notVerified')}
                                        </p>
                                        <Button 
                                            variant="outline-warning" 
                                            size="sm"
                                            onClick={handleSendVerification}
                                            disabled={sendingEmail}
                                        >
                                            {sendingEmail ? t('sending') : t('sendVerification')}
                                        </Button>
                                    </div>
                                )}

                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    disabled={updatingProfile || displayName === user.displayName}
                                    className="mt-3"
                                >
                                    {updatingProfile ? <Spinner size="sm" aria-label={t('saving')} /> : t('save')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};
