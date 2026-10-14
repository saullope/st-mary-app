'use client';

import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { FaBookOpen } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import { notify } from '@/components/ui';
import SubjectPicker from '@/features/subjects/components/SubjectPicker';
import filterStyles from '@/components/dashboard/ActivityFilter.module.css';
import type { Subject } from '@/features/subjects/subjectSchemas';
import styles from './Settings.module.css';

interface SubjectSettingsProps {
  subjectsByGrade: Record<number, Subject[]>;
  initialSelected: Record<number, number[]>;
}

/** Clases que imparte el educador en cada grado; se usan para proponerle actividades. */
export const SubjectSettings = ({ subjectsByGrade, initialSelected }: SubjectSettingsProps) => {
  const t = useTranslations('SubjectSettings');
  const tCommon = useTranslations('Common');
  const gradeIds = Object.keys(subjectsByGrade).map(Number).sort();
  const [gradeId, setGradeId] = useState<number | null>(gradeIds[0] ?? null);
  const [selected, setSelected] = useState<Record<number, number[]>>(initialSelected);
  const [saving, setSaving] = useState(false);

  if (gradeId === null) return null;
  const gradeName = (id: number) => tCommon(`grades.${id as 1 | 2 | 3}`);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gradeId, materiaIds: selected[gradeId] ?? [] }),
      });
      if (!response.ok) throw new Error(String(response.status));
      notify.success(t('saved', { grade: gradeName(gradeId) }));
    } catch {
      notify.error(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={`${styles.card} mt-4`}>
      <Card.Body>
        <h5 className={styles.cardTitle}><FaBookOpen className="me-2" aria-hidden="true" /> {t('title')}</h5>
        <p className="text-muted">{t('description')}</p>

        <nav className="d-flex flex-wrap gap-2 mb-3" aria-label={t('gradeLabel')}>
          {gradeIds.map((id) => (
            <button
              key={id}
              type="button"
              className={`${filterStyles.chip} ${id === gradeId ? filterStyles.chipActive : ''}`}
              style={id === gradeId ? undefined : { color: '#3B2A9E', borderColor: '#D6D0EF' }}
              aria-pressed={id === gradeId}
              onClick={() => setGradeId(id)}
            >
              {gradeName(id)}
            </button>
          ))}
        </nav>

        <SubjectPicker
          subjects={subjectsByGrade[gradeId] ?? []}
          value={selected[gradeId] ?? []}
          onChange={(ids) => setSelected((current) => ({ ...current, [gradeId]: ids }))}
          label={t('pickerLabel', { grade: gradeName(gradeId) })}
        />

        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn"
            style={{ background: '#6a4bff', color: '#ffffff', fontWeight: 700, borderRadius: '10px' }}
            onClick={save}
            disabled={saving}
          >
            {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {t('save')}
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};
