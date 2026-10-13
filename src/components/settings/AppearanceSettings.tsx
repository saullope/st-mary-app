'use client';

import { Card, Form } from 'react-bootstrap';
import { FaGlobe, FaPalette } from 'react-icons/fa';
import { LocaleSwitcherSelect } from '@/components/LocaleSwitcherSelect';
import { useTranslations, useLocale } from 'next-intl';
import styles from './Settings.module.css';

export const AppearanceSettings = () => {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const ta = useTranslations('AppearanceSettings');

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
