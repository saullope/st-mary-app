// src/hooks/useSession.ts
import { useAuth } from "./useAuth";

export const useSession = () => {
    const auth = useAuth();
    
    return {
        session: auth.user,
        setSession: auth.updateSession,
        setUpdate: auth.refreshUserSession,
        selectedGrade: auth.selectedGrade,
        setSelectedGrade: auth.setSelectedGrade,
    };
}
