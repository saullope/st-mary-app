import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase';
import { login, logout } from '../store/auth';
import { useSelector, useDispatch } from 'react-redux'

export const useCheckAuth = () => {
    const { status } = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {

            if (!user) return dispatch(logout(status));

            //print in console the user
            console.log(`user: ${JSON.stringify(user)}`);
            const { uid, email, displayName, photoURL } = user;
            dispatch(login({ uid, email, displayName, photoURL }));
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [dispatch]);

    return {
        status
    };
}