import { loginWithEmail, createSessionOnServer } from './authService';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase/firebase';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase Init
jest.mock('@/firebase/firebase', () => ({
  auth: {},
}));

// Mock global fetch
global.fetch = jest.fn();

describe('authService', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSessionOnServer', () => {
    it('should return success true when server responds ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await createSessionOnServer('fake-token');
      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object));
    });

    it('should return success false when server responds with error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid token' }),
      });

      const result = await createSessionOnServer('fake-token');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid token');
    });
  });

  describe('loginWithEmail', () => {
    it('should return success and user when login is successful', async () => {
      // Mock Firebase success
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: {
          getIdToken: jest.fn().mockResolvedValue('fake-token'),
          displayName: 'Test User',
        },
      });

      // Mock Server Session success
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      const result = await loginWithEmail('test@example.com', 'password');
      
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password');
      expect(result.success).toBe(true);
      expect(result.user?.displayName).toBe('Test User');
    });

    it('should handle user not found', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: null,
      });

      const result = await loginWithEmail('test@example.com', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
    });
  });
});
