import { auth } from "@/firebase/firebase";
import { 
    checkingCredentials, 
    login, 
    logout, 
    setLoginError, 
    setLoading,
    updateSession,
    clearSession
} from "./authSlice";
import { Dispatch } from "@reduxjs/toolkit";
import { getUserInfo } from "@/lib/user/getUserInfo";
import { AUTH_API_ROUTES } from "@/lib/auth/constants";

type AppDispatch = Dispatch<any>;

export const checkingAuthentication = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(checkingCredentials());
    }
}

export const startLogout = () => {
    return async (dispatch: AppDispatch) => {
        try {
            // Sign out from Firebase client
            await auth.signOut();
            
            // Clear server-side session cookie
            await fetch(AUTH_API_ROUTES.LOGOUT, { method: 'POST' });
            
            dispatch(logout());
        } catch (error) {
            console.error('Logout error:', error);
            dispatch(logout());
        }
    }
}

export const fetchUserSession = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(setLoading(true));
        
        try {
            const response = await fetch(AUTH_API_ROUTES.ME);
            if (response.status === 200) {
                const data = await response.json();
                const userUID = data?.uid;
                const userEmail = data?.email;
                
                if (userUID && userUID !== "") {
                    const userInfo = await getUserInfo(userUID);
                    if (userInfo) {
                        dispatch(updateSession({
                            uid: userInfo.uid,
                            email: userEmail || "",
                            photoURL: userInfo.photoURL,
                            displayName: userInfo.displayName
                        }));
                    } else {
                        // User exists in session but no Firestore data
                        dispatch(updateSession({
                            uid: userUID,
                            email: userEmail || "",
                            photoURL: "",
                            displayName: ""
                        }));
                    }
                } else {
                    dispatch(clearSession());
                }
            } else {
                dispatch(clearSession());
            }
        } catch (error) {
            console.error("Error fetching user session:", error);
            dispatch(clearSession());
        } finally {
            dispatch(setLoading(false));
        }
    }
}

export const refreshUserSession = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(fetchUserSession());
    }
}