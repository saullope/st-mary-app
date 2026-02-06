import { useEffect, useCallback, useRef } from 'react';
import { auth } from '@/firebase/firebase';
import { SESSION_CHECK_INTERVAL_MS, AUTH_API_ROUTES } from '@/lib/auth/constants';

interface UseTokenRefreshOptions {
    enabled?: boolean;
    onRefreshError?: (error: Error) => void;
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
    const { enabled = true, onRefreshError } = options;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const refreshSession = useCallback(async () => {
        try {
            // Check if session needs refresh
            const checkResponse = await fetch(AUTH_API_ROUTES.REFRESH);
            const checkData = await checkResponse.json();

            if (!checkData.needsRefresh) {
                return { refreshed: false, message: 'Session still valid' };
            }

            // Get fresh ID token from Firebase client
            const user = auth.currentUser;
            if (!user) {
                return { refreshed: false, message: 'No user logged in' };
            }

            const idToken = await user.getIdToken(true);

            // Send fresh token to create new session cookie
            const refreshResponse = await fetch(AUTH_API_ROUTES.REFRESH, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            if (!refreshResponse.ok) {
                throw new Error('Failed to refresh session');
            }

            const refreshData = await refreshResponse.json();
            return { refreshed: true, message: refreshData.message };

        } catch (error) {
            console.error('Token refresh error:', error);
            if (onRefreshError && error instanceof Error) {
                onRefreshError(error);
            }
            return { refreshed: false, error };
        }
    }, [onRefreshError]);

    useEffect(() => {
        if (!enabled) return;

        // Initial check on mount
        refreshSession();

        // Set up periodic refresh check
        intervalRef.current = setInterval(() => {
            refreshSession();
        }, SESSION_CHECK_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, refreshSession]);

    return { refreshSession };
};

