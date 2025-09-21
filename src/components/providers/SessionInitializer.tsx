'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Componente que inicializa la sesión del usuario al cargar la aplicación
 * Se ejecuta una sola vez y no renderiza contenido visual
 */
export const SessionInitializer = () => {
    const { fetchUserSession } = useAuth();
    const isSessionInitialized = useRef(false);

    useEffect(() => {
        // Solo inicializar una vez al montar el componente
        if (!isSessionInitialized.current) {
            console.debug('🚀 Initializing user session...');
            isSessionInitialized.current = true;
            fetchUserSession();
        }
    }, [fetchUserSession]);

    return null; // Este componente no renderiza nada
};
