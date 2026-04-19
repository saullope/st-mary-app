'use client';

import { Card, Form } from 'react-bootstrap';
import { FaGlobe, FaPalette } from 'react-icons/fa';
import { LocaleSwitcherSelect } from '@/components/LocaleSwitcherSelect';
import { useTranslations, useLocale } from 'next-intl';
import styles from './Settings.module.css';

export const AppearanceSettings = () => {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Apariencia e Idioma</h2>
            <p className={styles.subtitle}>Personaliza tu experiencia de usuario en LudiGame.</p>

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}>
                                <FaGlobe className="me-2" /> Preferencia de Idioma
                            </h5>
                            <p className="text-muted mb-3">
                                Selecciona el idioma en el que deseas visualizar la interfaz de LudiGame. 
                                Esta preferencia se guardará automáticamente.
                            </p>
                            
                            <div style={{ maxWidth: '250px' }}>
                                <LocaleSwitcherSelect
                                    defaultValue={locale}
                                    items={[
                                        { value: 'en', label: t('en') },
                                        { value: 'es', label: t('es') }
                                    ]}
                                    label={t('label')}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}>
                                <FaPalette className="me-2" /> Tema de la Interfaz
                            </h5>
                            <p className="text-muted mb-3">
                                Configura los colores de la plataforma para mejorar tu visibilidad.
                            </p>
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="radio" 
                                        id="theme-light" 
                                        label="Modo Claro" 
                                        name="theme-options"
                                        checked
                                        readOnly
                                    />
                                    <Form.Text className="text-muted ms-4 d-block">
                                        Tema claro estándar. Activo actualmente.
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="radio" 
                                        id="theme-dark" 
                                        label="Modo Oscuro (Próximamente)" 
                                        name="theme-options"
                                        disabled
                                    />
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};
