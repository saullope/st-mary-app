import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase';
import { login, logout } from '../store/auth';
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store/store';

export const useCheckAuth = () => {
    const { status } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (!user) return dispatch(logout());

            const { uid, email, displayName, photoURL } = user;
            dispatch(login({ 
                uid, 
                email: email || '', 
                displayName: displayName || '', 
                photoURL: photoURL || '' 
            }));
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [dispatch, status]);

    return {
        status
    };
}