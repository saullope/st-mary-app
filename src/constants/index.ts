/**
 * Constantes de la aplicación LudiGame
 * Centraliza valores mágicos y configuraciones
 */

export const AUTH_CONSTANTS = {
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
    MAX_RETRY_ATTEMPTS: 3,
    DEBOUNCE_DELAY: 300,
    SESSION_COOKIE_NAME: 'session',
} as const;

export const API_CONSTANTS = {
    TIMEOUT: 10000, // 10 segundos
    RETRY_DELAY: 1000, // 1 segundo
} as const;

export const UI_CONSTANTS = {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    DEBOUNCE_SEARCH: 500,
} as const;

export const VALIDATION_CONSTANTS = {
    MIN_PASSWORD_LENGTH: 8,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
} as const;
