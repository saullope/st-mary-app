'use client';

import { useState } from 'react';
import { Button, Alert, Card, Spinner } from 'react-bootstrap';
import { FaDatabase, FaDownload } from 'react-icons/fa';
import styles from './Settings.module.css';
import { useTranslations } from 'next-intl';

export const DataSettings = () => {
    const t = useTranslations('DataSettings');
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
            
            if (!res.ok) throw new Error(`export-data ${res.status}`);

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mis_datos_ludigame_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            
            showMessage('success', t('exported'));
        } catch (error) {
            console.error(error);
            showMessage('danger', t('exportFailed'));
        } finally {
            setExporting(false);
        }
    };

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
                            <h5 className={styles.cardTitle}><FaDatabase className="me-2" aria-hidden="true" /> {t('exportTitle')}</h5>
                            <p className="text-muted mb-4">
                                {t('exportHint')}
                            </p>

                            <Button 
                                variant="outline-primary" 
                                onClick={handleExportData}
                                disabled={exporting}
                                className="d-flex align-items-center"
                            >
                                {exporting ? (
                                    <><Spinner size="sm" className="me-2" aria-hidden="true" /> {t('exporting')}</>
                                ) : (
                                    <><FaDownload className="me-2" aria-hidden="true" /> {t('download')}</>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};