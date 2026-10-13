// Auth configuration constants

export const AUTH_COOKIE_NAME = 'session';

// Duración de la sesión según OWASP (Session Management Cheat Sheet) y NIST SP 800-63B rev. 4 (AAL2):
// - Inactividad: OWASP recomienda 15-30 min en aplicaciones de riesgo bajo y NIST hasta 1 h.
//   Se usa 30 min porque la app maneja datos de estudiantes menores de edad.
// - Absoluta: NIST pide como máximo 24 h; se usa una jornada escolar. Al cumplirse hay que
//   volver a ingresar las credenciales aunque haya actividad.
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
export const SESSION_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000;
// Aviso previo para que el docente pueda seguir conectado o guardar su trabajo.
export const SESSION_WARNING_BEFORE_MS = 2 * 60 * 1000;
// Con actividad, la cookie se renueva como mucho cada 5 min; sin actividad vence sola.
export const SESSION_RENEW_INTERVAL_MS = 5 * 60 * 1000;
// Crear una sesión exige un inicio de sesión reciente: un cliente de Firebase que quedó
// abierto no puede generar una sesión nueva sin volver a pedir la contraseña.
export const RECENT_SIGN_IN_MS = 5 * 60 * 1000;

// La cookie dura lo mismo que la inactividad permitida; cada renovación la extiende.
export const AUTH_COOKIE_MAX_AGE = SESSION_IDLE_TIMEOUT_MS / 1000;

// Motivos de cierre que la pantalla de login explica al usuario.
export type SessionEndReason = 'idle' | 'absolute';

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
    '/dashboard',
    '/welcome-educator',
    '/create',
    '/settings',
    '/admin',
    '/views',
    '/view',
];

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/forgot-password',
    '/home',
];

// Auth API routes
export const AUTH_API_ROUTES = {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/signout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth',
};
