'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { auth } from '@/firebase/firebase';
import { updatePassword, sendPasswordResetEmail, User } from 'firebase/auth';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './Settings.module.css';

export const SecuritySettings = () => {
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
            showMessage('danger', 'Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('danger', 'La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        
        try {
            setUpdatingPassword(true);
            await updatePassword(user, newPassword);
            setNewPassword('');
            setConfirmPassword('');
            showMessage('success', 'Contraseña actualizada exitosamente.');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                showMessage('danger', 'Por razones de seguridad, debes cerrar sesión y volver a ingresar para cambiar tu contraseña.');
            } else {
                showMessage('danger', `Error al actualizar contraseña: ${error.message}`);
            }
        } finally {
            setUpdatingPassword(false);
        }
    };

    const handlePasswordResetEmail = async () => {
        if (!email) return;
        try {
            setSendingEmail(true);
            await sendPasswordResetEmail(auth, email);
            showMessage('success', 'Correo de recuperación de contraseña enviado exitosamente.');
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
            <h2 className={styles.title}>Seguridad de la Cuenta</h2>
            <p className={styles.subtitle}>Actualiza tus credenciales y protege tu cuenta.</p>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaLock className="me-2" /> Cambiar Contraseña</h5>
                            
                            <Form onSubmit={handleUpdatePassword}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nueva Contraseña</Form.Label>
                                    <InputGroup>
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"} 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <Button 
                                            variant="outline-secondary" 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </Button>
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control 
                                        type={showPassword ? "text" : "password"} 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite la nueva contraseña"
                                    />
                                </Form.Group>

                                <Button 
                                    variant="primary" 
                                    type="submit"
                                    disabled={updatingPassword || !newPassword || !confirmPassword}
                                >
                                    {updatingPassword ? <Spinner size="sm" /> : 'Cambiar Contraseña'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaEnvelope className="me-2" /> Recuperación</h5>
                            
                            <p className="mb-3 text-muted">
                                ¿Tienes problemas para recordar o quieres restablecer tu contraseña actual de forma segura? 
                                Te enviaremos un correo a <strong>{email}</strong> con instrucciones para restablecerla.
                            </p>
                            
                            <Button 
                                variant="outline-secondary" 
                                onClick={handlePasswordResetEmail}
                                disabled={sendingEmail}
                            >
                                {sendingEmail ? 'Enviando...' : 'Enviar correo de recuperación'}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};
