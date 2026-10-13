'use client';

import { useState, useEffect } from 'react';
import { Button, Alert, Card, Spinner, Table } from 'react-bootstrap';
import { FaUsersCog, FaTrash } from 'react-icons/fa';
import styles from './Settings.module.css';
import { useFormatter, useTranslations } from 'next-intl';

interface UserData {
    id: string;
    nombre: string;
    email: string;
    createdAt: string;
    rol: { nombre: string };
}

export const AdminUsers = () => {
    const t = useTranslations('AdminUsers');
    const format = useFormatter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users');
            if (!res.ok) {
                setError(res.status === 403 ? t('forbidden') : t('loadFailed'));
                return;
            }
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
            setError(t('loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showMessage = (type: 'success' | 'danger', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const confirmDelete = (user: UserData) => {
        setUserToDelete(user);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            setIsDeleting(true);
            const res = await fetch(`/api/admin/users?id=${userToDelete.id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error(`delete user ${res.status}`);

            showMessage('success', t('deleted', { name: userToDelete.nombre }));
            setUsers(users.filter(u => u.id !== userToDelete.id));
        } catch (err) {
            console.error(err);
            showMessage('danger', t('deleteFailed'));
        } finally {
            setIsDeleting(false);
            setShowModal(false);
            setUserToDelete(null);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Alert variant="danger" role="alert">{error}</Alert>
            </div>
        );
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

            <Card className={styles.card}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                        <h5 className="m-0 text-dark fw-bold"><FaUsersCog className="me-2" aria-hidden="true" /> {t('listTitle')}</h5>
                        <span className="badge bg-primary px-3 py-2">{t('count', { count: users.length })}</span>
                    </div>

                    {users.length === 0 ? (
                        <Alert variant="info">{t('empty')}</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">{t('name')}</th>
                                        <th scope="col">{t('email')}</th>
                                        <th scope="col">{t('role')}</th>
                                        <th scope="col">{t('createdAt')}</th>
                                        <th scope="col" className="text-center">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="fw-medium">{u.nombre}</td>
                                            <td>{u.email || t('noEmail')}</td>
                                            <td><span className="badge bg-secondary">{t.has(`roles.${u.rol.nombre}`) ? t(`roles.${u.rol.nombre}`) : u.rol.nombre}</span></td>
                                            <td>{format.dateTime(new Date(u.createdAt), { dateStyle: 'medium' })}</td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => confirmDelete(u)}
                                                    title={t('delete')}
                                                    aria-label={t('deleteUser', { name: u.nombre })}
                                                >
                                                    <FaTrash aria-hidden="true" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {showModal && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
                    onClick={() => !isDeleting && setShowModal(false)}
                >
                    <Card 
                        style={{ maxWidth: '500px', width: '90%' }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-user-title"
                    >
                        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                            <h5 id="delete-user-title" className="m-0">{t('confirmTitle')}</h5>
                            {!isDeleting && (
                                <Button 
                                    variant="link" 
                                    className="text-white p-0" 
                                    onClick={() => setShowModal(false)}
                                    style={{ fontSize: '1.5rem', lineHeight: 1 }}
                                    aria-label={t('close')}
                                >
                                    ×
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="warning" className="fw-bold mb-3">
                                {t('irreversible')}
                            </Alert>
                            <p>
                                {t.rich('confirmBody', { name: userToDelete?.nombre ?? '', strong: (chunks) => <strong>{chunks}</strong> })}
                            </p>
                            <p className="text-muted small">
                                {t('confirmDetail')}
                            </p>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isDeleting}>
                                {t('cancel')}
                            </Button>
                            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <Spinner size="sm" aria-label={t('deleting')} /> : t('confirm')}
                            </Button>
                        </Card.Footer>
                    </Card>
                </div>
            )}
        </div>
    );
};
