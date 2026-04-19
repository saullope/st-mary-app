// Auth configuration constants

export const AUTH_COOKIE_NAME = 'session';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds
export const AUTH_COOKIE_MAX_AGE_MS = AUTH_COOKIE_MAX_AGE * 1000; // 5 days in milliseconds

// Token refresh threshold: refresh when less than 1 hour remains
export const TOKEN_REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

// Session check interval for client-side refresh
export const SESSION_CHECK_INTERVAL_MS = 55 * 60 * 1000; // 55 minutes

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
    '/dashboard',
    '/welcome-educator',
    '/create',
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

