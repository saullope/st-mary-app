import { auth } from "@/firebase/firebase";
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    sendEmailVerification, 
    updateProfile,
    sendPasswordResetEmail
} from "firebase/auth";

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: { displayName: string | null };
}

export interface RegisterResponse extends LoginResponse {
    emailVerified?: boolean;
}

/**
 * Sends a password reset email to the user
 */
export const sendResetPasswordEmail = async (email: string): Promise<LoginResponse> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: unknown) {
         // Log internally but return generic or specific error depending on policy
         console.error("Reset password error:", error);
         // Return success false, but the UI might choose to show a generic message for security
         return { success: false, message: "Error sending email" };
    }
};

/**
 * Sends the ID token to the Next.js server to create a session cookie.
 */
export const createSessionOnServer = async (idToken: string): Promise<Omit<LoginResponse, 'user'>> => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      // Try to parse error message from server
      const data = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: data.error || "Failed to create session on server" 
      };
    }
  } catch (error) {
    console.error("Session creation error:", error);
    return { success: false, message: "Network error during session creation" };
  }
};

/**
 * Handles the complete login flow: Firebase Auth -> Server Session
 */
export const loginWithEmail = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user) return { success: false, message: "User not found" };

    const idToken = await userCredential.user.getIdToken(true);
    const sessionResponse = await createSessionOnServer(idToken);

    if (!sessionResponse.success) {
        return sessionResponse;
    }

    return {
        success: true,
        user: { displayName: userCredential.user.displayName }
    };

  } catch (error: unknown) {
    throw error; // Let the component handle Firebase specific errors
  }
};

/**
 * Handles the complete Google login flow
 */
export const loginWithGoogle = async (): Promise<LoginResponse> => {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (!result.user) return { success: false, message: "Google authentication failed" };

    const idToken = await result.user.getIdToken(true);
    const sessionResponse = await createSessionOnServer(idToken);
    
    if (!sessionResponse.success) {
        return sessionResponse;
    }

    return {
        success: true,
        user: { displayName: result.user.displayName }
    };
  } catch (error: unknown) {
    throw error;
  }
};

/**
 * Handles the complete registration flow with auto-login
 */
export const registerUser = async (
    email: string, 
    password: string, 
    name: string, 
    lastName: string
): Promise<RegisterResponse> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await sendEmailVerification(user);
        
        const fullName = `${name} ${lastName}`.trim();
        await updateProfile(user, { displayName: fullName });

        // Auto-login: Create session
        const idToken = await user.getIdToken(true);
        const sessionResponse = await createSessionOnServer(idToken);

        if (!sessionResponse.success) {
            // User created but session failed. Return success false but with specific message?
            // Or maybe consider it a partial success? For now, we fail the overall process 
            // but the user exists in Firebase.
             return { 
                success: false, 
                message: sessionResponse.message || "User created but failed to start session" 
            };
        }

        return {
            success: true,
            user: { displayName: fullName },
            emailVerified: false // Just created, so not verified yet usually
        };

    } catch (error: unknown) {
        throw error;
    }
};
