'use client';

import { useState } from 'react';
import { Button, Alert, Card, Spinner } from 'react-bootstrap';
import { FaDatabase, FaDownload } from 'react-icons/fa';
import styles from './Settings.module.css';

export const DataSettings = () => {
    const [exporting, setExporting] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);

    const showMessage = (type: 'success' | 'danger', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleExportData = async () => {
        try {
            setExporting(true);
            const res = await fetch('/api/user/export-data');
            
            if (!res.ok) {
                throw new Error("No se pudo exportar la información.");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis_datos_ludigame_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            showMessage('success', 'Tus datos se han exportado y descargado exitosamente.');
        } catch (error: any) {
            console.error(error);
            showMessage('danger', `Error: ${error.message}`);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Gestión de Datos</h2>
            <p className={styles.subtitle}>Controla, descarga y gestiona tu información almacenada en LudiGame.</p>

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}><FaDatabase className="me-2" /> Exportar Mi Información</h5>
                            <p className="text-muted mb-4">
                                Descarga una copia de todos los juegos que has creado, incluyendo preguntas, opciones y la configuración. 
                                La información se descargará en formato JSON, el cual es compatible con la mayoría de sistemas.
                            </p>

                            <Button 
                                variant="outline-primary" 
                                onClick={handleExportData}
                                disabled={exporting}
                                className="d-flex align-items-center"
                            >
                                {exporting ? (
                                    <><Spinner size="sm" className="me-2" /> Procesando y descargando...</>
                                ) : (
                                    <><FaDownload className="me-2" /> Descargar Datos (JSON)</>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};