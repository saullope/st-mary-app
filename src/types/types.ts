export const LOGIN_STATUS = {
  AUTHENTICATED: 'authenticated',
  NOT_AUTHENTICATED: 'not-authenticated',
  CHECKING: 'checking',
} as const;

export type LoginStatusValue = typeof LOGIN_STATUS[keyof typeof LOGIN_STATUS];