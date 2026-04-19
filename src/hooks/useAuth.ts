import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '@/store/store';
import { 
    setSelectedGrade, 
    setLoading,
    updateSession,
    clearSession
} from '@/store/auth/authSlice';
import { 
    fetchUserSession, 
    refreshUserSession 
} from '@/store/auth/thunks';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const authState = useSelector((state: RootState) => state.auth);

    const setGrade = useCallback((grade: string | null) => {
        dispatch(setSelectedGrade(grade));
    }, [dispatch]);

    const setUserLoading = useCallback((loading: boolean) => {
        dispatch(setLoading(loading));
    }, [dispatch]);

    const updateUserSession = useCallback((sessionData: {
        uid: string;
        email: string;
        displayName: string;
        photoURL: string;
    }) => {
        dispatch(updateSession(sessionData));
    }, [dispatch]);

    const clearUserSession = useCallback(() => {
        dispatch(clearSession());
    }, [dispatch]);

    const fetchSession = useCallback(() => {
        dispatch(fetchUserSession());
    }, [dispatch]);

    const refreshSession = useCallback(() => {
        dispatch(refreshUserSession());
    }, [dispatch]);

    return {
        // Estado
        user: authState.uid ? {
            uid: authState.uid,
            email: authState.email,
            displayName: authState.displayName,
            photoURL: authState.photoURL,
        } : null,
        selectedGrade: authState.selectedGrade,
        isLoading: authState.isLoading,
        isAuthenticated: authState.status === 'authenticated',
        lastUpdate: authState.lastUpdate,
        
        // Acciones
        setSelectedGrade: setGrade,
        setLoading: setUserLoading,
        updateSession: updateUserSession,
        clearSession: clearUserSession,
        fetchUserSession: fetchSession,
        refreshUserSession: refreshSession,
    };
};
