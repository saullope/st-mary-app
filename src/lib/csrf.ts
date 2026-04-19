import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // Simple validation - in production, you might want to store tokens in Redis/database
  // and validate against stored tokens with expiration
  return token === sessionToken;
}
