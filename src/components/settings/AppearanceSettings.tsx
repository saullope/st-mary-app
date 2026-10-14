'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Form } from 'react-bootstrap';
import { FaGlobe, FaPalette } from 'react-icons/fa';
import { setUserLocale } from '@/services/locale';
import type { Locale } from '@/config';
import { useTranslations, useLocale } from 'next-intl';
import styles from './Settings.module.css';

export const AppearanceSettings = () => {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const ta = useTranslations('AppearanceSettings');
    const router = useRouter();
    const [changingLocale, startTransition] = useTransition();

    // Mismo efecto que el selector de la barra superior, con un campo de formulario estándar.
    const changeLocale = async (value: string) => {
        await setUserLocale(value as Locale);
        startTransition(() => router.refresh());
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{ta('title')}</h2>
            <p className={styles.subtitle}>{ta('subtitle')}</p>

            <div className="row">
                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}>
                                <FaGlobe className="me-2" aria-hidden="true" /> {ta('languageTitle')}
                            </h5>
                            <p className="text-muted mb-3">
                                {ta('languageHint')}
                            </p>
                            
                            <Form.Group controlId="settings-language" style={{ maxWidth: '280px' }}>
                                <Form.Label>{t('label')}</Form.Label>
                                <Form.Select
                                    defaultValue={locale}
                                    onChange={(e) => changeLocale(e.target.value)}
                                    disabled={changingLocale}
                                >
                                    <option value="es">{t('es')}</option>
                                    <option value="en">{t('en')}</option>
                                </Form.Select>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-lg-8 mb-4">
                    <Card className={styles.card}>
                        <Card.Body>
                            <h5 className={styles.cardTitle}>
                                <FaPalette className="me-2" aria-hidden="true" /> {ta('themeTitle')}
                            </h5>
                            <p className="text-muted mb-3">
                                {ta('themeHint')}
                            </p>
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="radio" 
                                        id="theme-light" 
                                        label={ta('light')} 
                                        name="theme-options"
                                        checked
                                        readOnly
                                    />
                                    <Form.Text className="text-muted ms-4 d-block">
                                        {ta('lightHint')}
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="radio" 
                                        id="theme-dark" 
                                        label={ta('darkSoon')} 
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
