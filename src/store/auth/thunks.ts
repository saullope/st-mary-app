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
                
                if (userUID && userUID !== "") {
                    // Ya no llamamos a getUserInfo() que consultaba Firestore y causaba 
                    // errores offline "Failed to get document because the client is offline".
                    // En su lugar, el endpoint /api/auth ahora devuelve todos los datos desde SQL Server.
                    dispatch(updateSession({
                        uid: userUID,
                        email: data.email || "",
                        photoURL: data.photoURL || "",
                        displayName: data.displayName || ""
                    }));
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