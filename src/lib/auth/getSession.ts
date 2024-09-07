// src/lib/auth/getSession.ts
import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/firebase-admin";

//Get the user from the session cookie
//if theres no session or its invalid, return null
const getSession = async () => {
    const session = cookies().get("session")?.value
    if (!session) {
        return null
    }
    const user = await adminAuth.verifySessionCookie(session, true)
    return user;
}

export default getSession;