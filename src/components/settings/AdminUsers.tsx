'use client';

import { useState, useEffect } from 'react';
import { Button, Alert, Card, Spinner, Table } from 'react-bootstrap';
import { FaUsersCog, FaTrash } from 'react-icons/fa';
import styles from './Settings.module.css';

interface UserData {
    id: string;
    nombre: string;
    email: string;
    createdAt: string;
    rol: { nombre: string };
}

export const AdminUsers = () => {
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
                if (res.status === 403) throw new Error("No tienes permisos de administrador.");
                throw new Error("No se pudo cargar la lista de usuarios.");
            }
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
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

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "No se pudo eliminar al usuario.");
            }

            showMessage('success', `El usuario ${userToDelete.nombre} ha sido eliminado exitosamente.`);
            setUsers(users.filter(u => u.id !== userToDelete.id));
        } catch (err: any) {
            showMessage('danger', err.message);
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
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Administración de Usuarios</h2>
            <p className={styles.subtitle}>Gestiona las cuentas de los educadores registrados en la plataforma.</p>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <Card className={styles.card}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                        <h5 className="m-0 text-dark fw-bold"><FaUsersCog className="me-2" /> Lista de Educadores</h5>
                        <span className="badge bg-primary px-3 py-2">{users.length} Usuarios</span>
                    </div>

                    {users.length === 0 ? (
                        <Alert variant="info">No hay educadores registrados actualmente.</Alert>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Correo</th>
                                        <th>Rol</th>
                                        <th>Fecha de Registro</th>
                                        <th className="text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td className="fw-medium">{u.nombre}</td>
                                            <td>{u.email || 'N/A'}</td>
                                            <td><span className="badge bg-secondary">{u.rol.nombre}</span></td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td className="text-center">
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => confirmDelete(u)}
                                                    title="Eliminar usuario"
                                                >
                                                    <FaTrash />
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
                    >
                        <Card.Header className="bg-danger text-white d-flex justify-content-between align-items-center">
                            <h5 className="m-0">Confirmar Eliminación</h5>
                            {!isDeleting && (
                                <Button 
                                    variant="link" 
                                    className="text-white p-0" 
                                    onClick={() => setShowModal(false)}
                                    style={{ fontSize: '1.5rem', lineHeight: 1 }}
                                >
                                    ×
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="warning" className="fw-bold mb-3">
                                ¡Atención! Esta acción es irreversible.
                            </Alert>
                            <p>
                                ¿Estás seguro de que deseas eliminar permanentemente a <strong>{userToDelete?.nombre}</strong>?
                            </p>
                            <p className="text-muted small">
                                Esto eliminará todos sus datos, incluyendo las actividades creadas y los reportes de sus estudiantes.
                            </p>
                        </Card.Body>
                        <Card.Footer className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isDeleting}>
                                Cancelar
                            </Button>
                            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <Spinner size="sm" /> : 'Sí, Eliminar Permanentemente'}
                            </Button>
                        </Card.Footer>
                    </Card>
                </div>
            )}
        </div>
    );
};
