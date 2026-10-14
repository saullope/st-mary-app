'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Form, Button, Card, Spinner, Badge, Modal } from 'react-bootstrap';
import { FaRoute, FaPlay, FaRedo, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { useTourPreferences } from '@/hooks/useTourPreferences';
import { ONBOARDING_JOURNEY } from '@/lib/tours/tourProgress';
import { FAQ, TOUR_GROUPS, TOUR_REGISTRY, getTour, tourHref, type TourDefinition } from '@/lib/tours/tourRegistry';
import styles from './Settings.module.css';

type TourStatus = 'completed' | 'later' | 'pending' | 'soon';

const STATUS_BADGE: Record<TourStatus, string> = {
  completed: 'success',
  later: 'warning',
  pending: 'secondary',
  soon: 'light',
};

export const TourSettings = () => {
  const {
    preferences,
    isLoaded,
    setToursEnabled,
    setTourMode,
    resetAllTours,
    resetToursProgress,
    isTourCompleted,
    isTourPostponed,
  } = useTourPreferences();

  const t = useTranslations('TourSettings');
  const tTours = useTranslations('Tours.registry');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const statusOf = (tour: TourDefinition): TourStatus => {
    if (!tour.route) return 'soon';
    if (isTourCompleted(tour.id)) return 'completed';
    if (isTourPostponed(tour.id)) return 'later';
    return 'pending';
  };

  // Vuelve a ofrecer el recorrido inicial y lo empieza en Inicio (el grado ya está elegido).
  const restartOnboarding = () => {
    resetToursProgress(ONBOARDING_JOURNEY.filter((id) => id !== 'welcome_tour'));
    window.location.href = '/dashboard';
  };

  const handleResetTours = () => {
    resetAllTours();
    setShowResetConfirm(false);
  };

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">{t('loading')}</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('title')}</h2>
      <p className={styles.subtitle}>{t('subtitle')}</p>

      <div className="row">
        <div className="col-lg-8 mb-4">
          <Card className={styles.card}>
            <Card.Body>
              <h5 className={styles.cardTitle}>
                <FaRoute className="me-2" aria-hidden="true" />
                {t('general')}
              </h5>

              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  id="tours-enabled-switch"
                  label={t('enable')}
                  checked={preferences.toursEnabled}
                  onChange={(e) => setToursEnabled(e.target.checked)}
                />
                <Form.Text className="text-muted">{t('enableHint')}</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label as="legend" className="fs-6">{t('mode')}</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    name="tour-mode"
                    id="tour-mode-full"
                    label={t('modeFull')}
                    checked={preferences.tourMode === 'full'}
                    onChange={() => setTourMode('full')}
                    disabled={!preferences.toursEnabled}
                  />
                  <Form.Check
                    type="radio"
                    name="tour-mode"
                    id="tour-mode-hints"
                    label={t('modeHints')}
                    checked={preferences.tourMode === 'hints'}
                    onChange={() => setTourMode('hints')}
                    disabled={!preferences.toursEnabled}
                  />
                </div>
                <Form.Text className="text-muted">
                  {preferences.tourMode === 'full' ? t('modeFullHint') : t('modeHintsHint')}
                </Form.Text>
              </Form.Group>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Button variant="primary" onClick={restartOnboarding}>
                  <FaPlay className="me-2" aria-hidden="true" />
                  {t('restartOnboarding')}
                </Button>
                <Button variant="outline-warning" onClick={() => setShowResetConfirm(true)}>
                  <FaRedo className="me-2" aria-hidden="true" />
                  {t('resetAll')}
                </Button>
              </div>
              <Form.Text className="text-muted d-block mt-2">
                <FaInfoCircle className="me-1" aria-hidden="true" />
                {t('laterHint')}
              </Form.Text>
            </Card.Body>
          </Card>
        </div>

        {TOUR_GROUPS.map((group) => (
          <div key={group} className="col-lg-8 mb-4">
            <Card className={styles.card}>
              <Card.Body>
                <h5 className={styles.cardTitle}>
                  <FaPlay className="me-2" aria-hidden="true" />
                  {t(`groups.${group}.title`)}
                </h5>
                <p className="text-muted mb-4">{t(`groups.${group}.hint`)}</p>

                <ul className="list-unstyled d-flex flex-column gap-3 mb-0">
                  {TOUR_REGISTRY.filter((tour) => tour.group === group).map((tour) => {
                    const status = statusOf(tour);
                    const href = tourHref(tour);
                    return (
                      <li
                        key={tour.id}
                        className="d-flex justify-content-between align-items-center gap-3 p-3 border rounded"
                        style={{ backgroundColor: '#f8f9fa' }}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                            <strong>{tTours(`${tour.id}.name`)}</strong>
                            <Badge bg={STATUS_BADGE[status]} text={status === 'soon' || status === 'later' ? 'dark' : undefined}>
                              {t(`status.${status}`)}
                            </Badge>
                          </div>
                          <small className="text-muted">{tTours(`${tour.id}.description`)}</small>
                        </div>
                        {href ? (
                          <Link
                            href={href}
                            className="btn btn-primary btn-sm text-nowrap"
                            aria-label={t('playTour', { name: tTours(`${tour.id}.name`) })}
                          >
                            <FaPlay className="me-1" aria-hidden="true" />
                            {status === 'completed' ? t('replay') : t('play')}
                          </Link>
                        ) : (
                          <span className="text-muted small text-nowrap">{t('status.soon')}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card.Body>
            </Card>
          </div>
        ))}

        <div className="col-lg-8 mb-4">
          <Card className={styles.card}>
            <Card.Body>
              <h5 className={styles.cardTitle}>
                <FaQuestionCircle className="me-2" aria-hidden="true" />
                {t('faq.title')}
              </h5>
              <p className="text-muted mb-4">{t('faq.hint')}</p>

              <div className="d-flex flex-column gap-2">
                {FAQ.map((entry) => {
                  const tour = entry.tourId ? getTour(entry.tourId) : undefined;
                  const href = tour ? tourHref(tour) : null;
                  return (
                    <details key={entry.id} className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <summary className="fw-bold" style={{ cursor: 'pointer' }}>{t(`faq.items.${entry.id}.question`)}</summary>
                      <p className="mt-2 mb-2">{t(`faq.items.${entry.id}.answer`)}</p>
                      {href && tour && (
                        <Link href={href} className="btn btn-outline-primary btn-sm">
                          <FaPlay className="me-1" aria-hidden="true" />
                          {t('faq.watch', { name: tTours(`${tour.id}.name`) })}
                        </Link>
                      )}
                    </details>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={showResetConfirm} onHide={() => setShowResetConfirm(false)} centered aria-labelledby="reset-tours-title">
        <Modal.Header closeButton closeLabel={t('cancel')}>
          <Modal.Title id="reset-tours-title" as="h2" className="fs-5">{t('confirmTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-muted">{t('confirmBody')}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>{t('cancel')}</Button>
          <Button variant="warning" onClick={handleResetTours}>
            <FaRedo className="me-2" aria-hidden="true" />
            {t('reset')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
