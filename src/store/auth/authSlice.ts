import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LOGIN_STATUS, LoginStatusValue } from '../../types';

interface AuthState {
    status: LoginStatusValue;
    uid: string | null;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    errorLogin: string | null;
    errorSignup: string | null;
    // Funcionalidades del SessionContext
    selectedGrade: string | null;
    isLoading: boolean;
    lastUpdate: number | null;
}

const initialState: AuthState = {
    status: LOGIN_STATUS.CHECKING,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    errorLogin: null,
    errorSignup: null,
    // Funcionalidades del SessionContext
    selectedGrade: null,
    isLoading: false,
    lastUpdate: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, { payload }: PayloadAction<{
            uid: string;
            email: string;
            displayName: string;
            photoURL: string;
        }>) => {
            state.status = LOGIN_STATUS.AUTHENTICATED;
            state.uid = payload.uid;
            state.email = payload.email;
            state.displayName = payload.displayName;
            state.photoURL = payload.photoURL;
            state.errorLogin = null;  // Resetea el error de login en caso de éxito
            state.errorSignup = null; // Resetea el error de registro en caso de éxito
        },
        logout: (state) => {
            state.status = LOGIN_STATUS.NOT_AUTHENTICATED;
            state.uid = null;
            state.email = null;
            state.displayName = null;
            state.photoURL = null;
        },
        checkingCredentials: (state) => {
            state.status = LOGIN_STATUS.CHECKING;
        },
        setLoginError: (state, { payload }: PayloadAction<string | null>) => {
            state.errorLogin = payload;
        },
        setSignupError: (state, { payload }: PayloadAction<string | null>) => {
            state.errorSignup = payload;
        },
        // Nuevos reducers para funcionalidades del SessionContext
        setSelectedGrade: (state, { payload }: PayloadAction<string | null>) => {
            state.selectedGrade = payload;
        },
        setLoading: (state, { payload }: PayloadAction<boolean>) => {
            state.isLoading = payload;
        },
        updateSession: (state, { payload }: PayloadAction<{
            uid: string;
            email: string;
            displayName: string;
            photoURL: string;
        }>) => {
            state.uid = payload.uid;
            state.email = payload.email;
            state.displayName = payload.displayName;
            state.photoURL = payload.photoURL;
            state.status = LOGIN_STATUS.AUTHENTICATED;
            state.lastUpdate = Date.now();
        },
        clearSession: (state) => {
            state.uid = null;
            state.email = null;
            state.displayName = null;
            state.photoURL = null;
            state.status = LOGIN_STATUS.NOT_AUTHENTICATED;
            state.selectedGrade = null;
            state.lastUpdate = null;
        }
    },
});

export const { 
    login, 
    logout, 
    checkingCredentials, 
    setLoginError, 
    setSignupError,
    setSelectedGrade,
    setLoading,
    updateSession,
    clearSession
} = authSlice.actions;
