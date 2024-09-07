import { registerUserWithEmailPassword, 
    signInWithGoogle, 
    LoginWithEmailPassword, 
    logoutFirebase } from "../../firebase/provider";
import { checkingCredentials, login, logout, setLoginError, setSignupError } from "./authSlice";
import { Dispatch } from "@reduxjs/toolkit";

type AppDispatch = Dispatch<any>;

export const checkingAuthentication = () => {

    return async (dispatch: AppDispatch) => {
        dispatch(checkingCredentials());
    }
}

export const startGoogleSignIn = () => {
    return async (dispatch: AppDispatch) => {
        dispatch(checkingCredentials());
        const {
            displayName,
            email,
            photoURL,
            uid,
            ok,
            errorMessage
        } = await signInWithGoogle();

        if(!ok){
            dispatch(setLoginError(`Error al iniciar sesión con Google: ${errorMessage}`));
            return dispatch(logout());
        }

        dispatch(login(
            {uid: uid || '', 
            photoURL: photoURL || '', 
            email: email || '', 
            displayName: displayName || ''}));

    }
    
}

export const startCreatingUserWithEmailAndPassword = (email: string, password: string, displayName: string) => {
    return async (dispatch: AppDispatch) => {
        dispatch(checkingCredentials());
        
        const { ok, uid, photoURL, errorMessage } = await registerUserWithEmailPassword({email, password, displayName});
    
        if(!ok){ 
            dispatch(setSignupError(`Error al crear cuenta: ${errorMessage}`));
            return dispatch(logout());
        }

        dispatch(login({
            uid: uid || '',
            email: email || '',
            displayName: displayName || '',
            photoURL: photoURL || ''
        }))
    }
}

export const startLoginWithEmailPassword = ( email: string, password : string) => {
    return async (dispatch : AppDispatch) => {
        dispatch(checkingCredentials());
        const { ok, uid, photoURL, displayName, errorMessage } = await LoginWithEmailPassword({email, password });

        if (!ok) {
            dispatch(setLoginError(`Error al iniciar sesión: ${errorMessage}`));
            return dispatch(logout());
        }

        dispatch(login({ 
            uid: uid || '', 
            photoURL: photoURL || '', 
            email: email || '', 
            displayName: displayName || '' }))
    }
}


export const startLogout = () => {
    return async (dispatch : AppDispatch) => {
        await logoutFirebase()
        dispatch(logout())
    }
}