'use client';

import { useState, useEffect } from 'react';
import { Form, Button, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { FaRoute, FaPlay, FaRedo, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { useTourPreferences, TourMode } from '@/hooks/useTourPreferences';
import { TOUR_REGISTRY } from '@/lib/tours/tourRegistry';
import styles from './Settings.module.css';
import { useTranslations } from 'next-intl';

export const TourSettings = () => {
  const {
    preferences,
    isLoaded,
    setToursEnabled,
    setTourMode,
    resetAllTours,
    isTourCompleted,
  } = useTourPreferences();

  const t = useTranslations('TourSettings');
  const tTours = useTranslations('Tours.registry');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
  }, [isLoaded]);

  const showMessage = (type: 'success' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleResetTours = () => {
    resetAllTours();
    setShowResetConfirm(false);
    showMessage('success', t('resetDone'));
  };

  const handlePlayTour = (tourId: string) => {
    const tour = TOUR_REGISTRY.find(t => t.id === tourId);
    if (!tour) return;

    localStorage.setItem(`trigger_tour_${tourId}`, 'true');
    showMessage('info', t('starting', { name: tTours(`${tour.id}.name`) }));

    const routeMap: Record<string, string> = {
      welcome_tour: '/welcome-educator',
      dashboard_tour: '/dashboard',
      create_activity_tour: '/dashboard/create-activity',
      ludiquiz_tour: '/create/ludiquiz',
    };

    const route = routeMap[tourId];
    if (route) {
      setTimeout(() => {
        window.location.href = route;
      }, 1000);
    }
  };

  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('title')}</h2>
      <p className={styles.subtitle}>
        {t('subtitle')}
      </p>

      {message && (
        <Alert variant={message.type} className="mb-4" dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

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
                <Form.Text className="text-muted">
                  {t('enableHint')}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>{t('mode')}</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="tour-mode-full"
                    label={t('modeFull')}
                    checked={preferences.tourMode === 'full'}
                    onChange={() => setTourMode('full')}
                    disabled={!preferences.toursEnabled}
                  />
                  <Form.Check
                    type="radio"
                    id="tour-mode-hints"
                    label={t('modeHints')}
                    checked={preferences.tourMode === 'hints'}
                    onChange={() => setTourMode('hints')}
                    disabled={!preferences.toursEnabled}
                  />
                </div>
                <Form.Text className="text-muted">
                  {preferences.tourMode === 'full'
                    ? t('modeFullHint')
                    : t('modeHintsHint')}
                </Form.Text>
              </Form.Group>

              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-warning"
                  onClick={() => setShowResetConfirm(true)}
                  disabled={!preferences.toursEnabled}
                >
                  <FaRedo className="me-2" aria-hidden="true" />
                  {t('resetAll')}
                </Button>
                <Form.Text className="text-muted mb-0">
                  <FaInfoCircle className="me-1" />
                  {t('resetAllHint')}
                </Form.Text>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-lg-8 mb-4">
          <Card className={styles.card}>
            <Card.Body>
              <h5 className={styles.cardTitle}>
                <FaPlay className="me-2" aria-hidden="true" />
                {t('available')}
              </h5>
              <p className="text-muted mb-4">
                {t('availableHint')}
              </p>

              <div className="d-flex flex-column gap-3">
                {TOUR_REGISTRY.map((tour) => {
                  const completed = isTourCompleted(tour.id);
                  return (
                    <div
                      key={tour.id}
                      className="d-flex justify-content-between align-items-center p-3 border rounded"
                      style={{ backgroundColor: '#f8f9fa' }}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong>{tTours(`${tour.id}.name`)}</strong>
                          {completed && (
                            <Badge bg="success" className="d-flex align-items-center gap-1">
                              <FaCheckCircle size={12} />
                              {t('completed')}
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted">{tTours(`${tour.id}.description`)}</small>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePlayTour(tour.id)}
                        className="ms-3"
                      >
                        <FaPlay className="me-1" aria-hidden="true" />
                        {t('play')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {showResetConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
          onClick={() => setShowResetConfirm(false)}
        >
          <Card
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card.Body role="dialog" aria-modal="true" aria-labelledby="reset-tours-title">
              <h5 id="reset-tours-title">{t('confirmTitle')}</h5>
              <p className="text-muted">{t('confirmBody')}</p>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
                  {t('cancel')}
                </Button>
                <Button variant="warning" onClick={handleResetTours}>
                  <FaRedo className="me-2" aria-hidden="true" />
                  {t('reset')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};
