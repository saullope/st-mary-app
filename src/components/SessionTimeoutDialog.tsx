'use client';

import { useEffect, useRef, useState } from 'react';
import type { SessionWarning } from '@/hooks/useSessionTimeout';
import styles from './SessionTimeoutDialog.module.css';
import { useTranslations } from 'next-intl';

interface SessionTimeoutDialogProps {
    warning: SessionWarning;
    onStay: () => void;
    onLogout: () => void;
}

const formatRemaining = (ms: number) => {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/** Aviso previo al cierre de sesión por inactividad o por el límite de duración. */
export const SessionTimeoutDialog = ({ warning, onStay, onLogout }: SessionTimeoutDialogProps) => {
    const [now, setNow] = useState(() => Date.now());
    const primaryRef = useRef<HTMLButtonElement>(null);
    const t = useTranslations('SessionTimeout');
    const isIdle = warning.reason === 'idle';

    useEffect(() => {
        primaryRef.current?.focus();
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.backdrop}>
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-timeout-title"
                aria-describedby="session-timeout-desc"
            >
                <h2 id="session-timeout-title" className={styles.title}>
                    {isIdle ? t('idleTitle') : t('expiringTitle')}
                </h2>
                <p id="session-timeout-desc" className={styles.text}>
                    {isIdle ? t('idleBody') : t('expiringBody')}
                </p>
                <p className={styles.countdown} aria-live="polite">
                    {formatRemaining(warning.endsAt - now)}
                </p>
                <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={onLogout}>
                        {t('logout')}
                    </button>
                    {isIdle && (
                        <button ref={primaryRef} type="button" className={styles.primary} onClick={onStay}>
                            {t('stay')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
