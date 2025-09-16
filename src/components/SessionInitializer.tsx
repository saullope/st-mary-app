'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const SessionInitializer = () => {
    const { fetchUserSession, isAuthenticated } = useAuth();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Solo inicializar una vez al montar el componente
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchUserSession();
        }
    }, [fetchUserSession]); // Include fetchUserSession in dependencies

    return null; // Este componente no renderiza nada
};
