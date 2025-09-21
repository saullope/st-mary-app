/**
 * Tipos relacionados con autenticación y sesión de usuario
 */

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
}

export interface AuthPayload extends UserData {}

export interface AuthError {
    code: string;
    message: string;
    type: 'error' | 'warning' | 'info';
}

export interface SessionData {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    lastUpdate: number;
}

export interface AuthResponse {
    isLogged: boolean;
    uid: string;
    email: string;
}
