'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

/**
 * Initializes user session and handles automatic token refresh
 */
export const SessionInitializer = () => {
    const { fetchUserSession, isAuthenticated, clearSession } = useAuth();
    const isSessionInitialized = useRef(false);

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
        if (!isSessionInitialized.current) {
            isSessionInitialized.current = true;
            fetchUserSession();
        }
    }, [fetchUserSession]);

    return null;
};
