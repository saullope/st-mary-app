'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { auth } from '@/firebase/firebase';
import { updateProfile, sendEmailVerification, User } from 'firebase/auth';
import { FaUser } from 'react-icons/fa';
import styles from './Settings.module.css';

export const PersonalInfo = () => {
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
            showMessage('success', 'Perfil actualizado exitosamente.');
        } catch (error: any) {
            console.error(error);
            showMessage('danger', `Error al actualizar perfil: ${error.message}`);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleSendVerification = async () => {
        if (!user) return;
        try {
            setSendingEmail(true);
            await sendEmailVerification(user);
            showMessage('success', 'Correo de verificación enviado. Por favor revisa tu bandeja de entrada.');
        } catch (error: any) {
            console.error(error);
            showMessage('danger', `Error al enviar correo: ${error.message}`);
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
            <h2 className={styles.title}>Información Personal</h2>
            <p className={styles.subtitle}>Administra tus datos personales.</p>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaUser className="me-2" /> Datos del Perfil</h5>
                            <Form onSubmit={handleUpdateProfile}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre Completo</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={displayName} 
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={email} 
                                        disabled
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                        El correo electrónico está vinculado a tu cuenta y no puede cambiarse desde aquí.
                                    </Form.Text>
                                </Form.Group>

                                {!user.emailVerified && (
                                    <div className="mb-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                        <p className="mb-2 text-warning-emphasis fw-bold">
                                            Tu correo electrónico no está verificado.
                                        </p>
                                        <Button 
                                            variant="outline-warning" 
                                            size="sm"
                                            onClick={handleSendVerification}
                                            disabled={sendingEmail}
                                        >
                                            {sendingEmail ? 'Enviando...' : 'Enviar correo de verificación'}
                                        </Button>
                                    </div>
                                )}

                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    disabled={updatingProfile || displayName === user.displayName}
                                    className="mt-3"
                                >
                                    {updatingProfile ? <Spinner size="sm" /> : 'Guardar Cambios'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};
