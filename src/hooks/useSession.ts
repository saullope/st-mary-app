// src/hooks/useSession.ts
import { SessionContext } from "@/contexts/SessionContext";
import { useContext } from "react"

export const useSession = () => {
    return useContext(SessionContext);
}
