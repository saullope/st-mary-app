'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

export const SessionInitializer = () => {
    const { fetchUserSession, isAuthenticated, clearSession } = useAuth();
    const hasInitialized = useRef(false);

    const handleRefreshError = useCallback((error: Error) => {
        console.error('Session refresh failed:', error);
        clearSession();
    }, [clearSession]);

    // Enable token refresh only when user is authenticated
    useTokenRefresh({
        enabled: isAuthenticated,
        onRefreshError: handleRefreshError,
    });

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            fetchUserSession();
        }
    }, [fetchUserSession]);

    return null;
};
