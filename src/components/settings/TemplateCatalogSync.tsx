'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import { FaShapes } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { syncTemplatesAction } from '@/app/settings/admin/templateCatalogActions';
import type { CatalogSyncReport } from '@/features/templates/templateCatalog.server';
import styles from './Settings.module.css';

/** Carga en la base las plantillas de src/features/templates/catalog. */
export const TemplateCatalogSync = () => {
  const t = useTranslations('TemplateCatalog');
  const [pending, startTransition] = useTransition();
  const [report, setReport] = useState<CatalogSyncReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = () =>
    startTransition(async () => {
      setError(null);
      const result = await syncTemplatesAction();
      if ('error' in result) setError(result.error);
      else setReport(result.report);
    });

  return (
    <Card className={`${styles.card} mt-4`}>
      <Card.Body>
        <h5 className={styles.cardTitle}><FaShapes className="me-2" aria-hidden="true" /> {t('title')}</h5>
        <p className="text-muted">{t('description')}</p>
        <Button variant="primary" onClick={sync} disabled={pending} aria-busy={pending}>
          {pending && <Spinner animation="border" size="sm" className="me-2" aria-hidden="true" />}
          {pending ? t('syncing') : t('sync')}
        </Button>

        <div role="status" className="mt-3">
          {error && <Alert variant="danger" className="mb-0">{error}</Alert>}
          {report && (
            <Alert variant={report.failed.length > 0 ? 'warning' : 'success'} className="mb-0">
              <p className="mb-1 fw-bold">
                {t('summary', {
                  created: report.created.length,
                  updated: report.updated.length,
                  unchanged: report.unchanged.length,
                  retired: report.retired.length,
                })}
              </p>
              {report.failed.length > 0 && (
                <>
                  <p className="mb-1">{t('failed', { count: report.failed.length })}</p>
                  <ul className="mb-0 small">
                    {report.failed.map((item) => (
                      <li key={item.code}><code>{item.code}</code>: {item.reason}</li>
                    ))}
                  </ul>
                </>
              )}
            </Alert>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};
