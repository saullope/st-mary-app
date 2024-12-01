// src/contexts/SessionContext/index.tsx
"use client";
import React, { createContext, useEffect, useState } from "react";
import { getUserInfo } from "@/lib/user/getUserInfo";

type UserSession = {
    uid: string,
    displayName: string;
    email: string;
    photoURL: string;
}

type AuthResponse = {
    uid: string,
    email: string
}

export const SessionContext = createContext<{
    session: UserSession | null;
    setSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
    setUpdate: React.Dispatch<React.SetStateAction<boolean>>;
    selectedGrade: string | null;
    setSelectedGrade: React.Dispatch<React.SetStateAction<string | null>>; 
}>({
    session: null,
    setSession: () => null,
    setUpdate: () => null,
    selectedGrade: null,
    setSelectedGrade: () => null,
});

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [session, setSession] = useState<UserSession | null>(null);
    const [update, setUpdate] = useState(false);
    const [ selectedGrade, setSelectedGrade ] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserData() {
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
                            setSession(sessionData);
                        }
                    }
                }
            } catch (error) {
                console.error("error: ", error);
            }
        }

        fetchUserData();
        setUpdate(false);
    }, [update]);

    const value = { session, setSession, setUpdate, selectedGrade, setSelectedGrade };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}