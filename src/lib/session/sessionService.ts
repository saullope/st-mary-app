import { getUserInfo } from "@/lib/user/getUserInfo";

export interface UserSession {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
}

export interface AuthResponse {
    uid: string;
    email: string;
}

export class SessionService {
    private static instance: SessionService;
    private session: UserSession | null = null;
    private listeners: ((session: UserSession | null) => void)[] = [];

    private constructor() {}

    public static getInstance(): SessionService {
        if (!SessionService.instance) {
            SessionService.instance = new SessionService();
        }
        return SessionService.instance;
    }

    public async fetchSession(): Promise<UserSession | null> {
        try {
            const response = await fetch("/api/auth");
            if (response.status === 200) {
                const data: AuthResponse = await response.json();
                const userUID = data?.uid;
                const userEmail = data?.email;
                
                if (userUID && userUID !== "") {
                    const userInfo = await getUserInfo(userUID);
                    if (userInfo) {
                        const sessionData: UserSession = {
                            email: userEmail || "",
                            uid: userInfo.uid,
                            photoURL: userInfo.photoURL,
                            displayName: userInfo.displayName
                        };
                        this.setSession(sessionData);
                        return sessionData;
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching session:", error);
        }
        
        this.setSession(null);
        return null;
    }

    public setSession(session: UserSession | null): void {
        this.session = session;
        this.notifyListeners();
    }

    public getSession(): UserSession | null {
        return this.session;
    }

    public subscribe(listener: (session: UserSession | null) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.session));
    }

    public clearSession(): void {
        this.setSession(null);
    }
}
