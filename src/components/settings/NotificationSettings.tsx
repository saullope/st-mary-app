'use client';

import { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { notify } from '@/components/ui';
import { NOTIFICATION_TYPES, type NotificationType } from '@/features/notifications/notificationTypes';
import styles from './Settings.module.css';

/** Qué avisos de la campana recibe el docente; cada cambio se guarda al momento. */
export const NotificationSettings = ({ initialMuted }: { initialMuted: NotificationType[] }) => {
  const t = useTranslations('Notifications.preferences');
  const tTypes = useTranslations('Notifications.types');
  const [muted, setMuted] = useState<NotificationType[]>(initialMuted);

  const toggle = async (type: NotificationType, enabled: boolean) => {
    const previous = muted;
    const next = enabled ? muted.filter((item) => item !== type) : [...muted, type];
    setMuted(next);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muted: next }),
      });
      if (!response.ok) throw new Error(String(response.status));
    } catch {
      setMuted(previous);
      notify.error(t('saveFailed'));
    }
  };

  return (
    <Card className={`${styles.card} mt-4`}>
      <Card.Body>
        <h5 className={styles.cardTitle}><FaBell className="me-2" aria-hidden="true" /> {t('title')}</h5>
        <p className="text-muted">{t('description')}</p>
        {NOTIFICATION_TYPES.map((type) => (
          <Form.Group key={type} className="mb-3">
            <Form.Check
              type="switch"
              id={`notification-${type}`}
              label={tTypes(`${type}.title`)}
              checked={!muted.includes(type)}
              onChange={(event) => toggle(type, event.target.checked)}
            />
            <Form.Text className="text-muted">{t(`hints.${type}`)}</Form.Text>
          </Form.Group>
        ))}
      </Card.Body>
    </Card>
  );
};
