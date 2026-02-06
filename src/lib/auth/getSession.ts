import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/firebase-admin";
import { AUTH_COOKIE_NAME } from "./constants";

// Returns decoded user from session cookie, or null if invalid/expired
const getSession = async () => {
    const session = cookies().get(AUTH_COOKIE_NAME)?.value;

    if (!session) {
        return null;
    }

    try {
        const user = await adminAuth.verifySessionCookie(session, true);
        return user;
    } catch (error: any) {
        if (error?.errorInfo?.code === "auth/session-cookie-expired") {
            console.log("Session cookie expired");
        }
        return null;
    }
};

export default getSession;