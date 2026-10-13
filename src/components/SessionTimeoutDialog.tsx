'use client';

import { useEffect, useRef, useState } from 'react';
import type { SessionWarning } from '@/hooks/useSessionTimeout';
import styles from './SessionTimeoutDialog.module.css';

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
                    {isIdle ? '¿Sigues ahí?' : 'Tu sesión está por terminar'}
                </h2>
                <p id="session-timeout-desc" className={styles.text}>
                    {isIdle
                        ? 'Por seguridad cerraremos tu sesión por inactividad.'
                        : 'Alcanzaste la duración máxima de una sesión. Guarda tu trabajo; tendrás que volver a iniciar sesión.'}
                </p>
                <p className={styles.countdown} aria-live="polite">
                    {formatRemaining(warning.endsAt - now)}
                </p>
                <div className={styles.actions}>
                    <button type="button" className={styles.secondary} onClick={onLogout}>
                        Cerrar sesión
                    </button>
                    {isIdle && (
                        <button ref={primaryRef} type="button" className={styles.primary} onClick={onStay}>
                            Seguir conectado
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
