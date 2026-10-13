'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionTimeoutDialog } from './SessionTimeoutDialog';

/** Carga la sesión del usuario y aplica los límites de inactividad y duración. */
export const SessionInitializer = () => {
    const { fetchUserSession, isAuthenticated, clearSession } = useAuth();
    const hasInitialized = useRef(false);
    const { warning, stayConnected, endNow } = useSessionTimeout(isAuthenticated, clearSession);

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchUserSession();
        }
    }, [fetchUserSession]);

    return warning ? <SessionTimeoutDialog warning={warning} onStay={stayConnected} onLogout={endNow} /> : null;
};
