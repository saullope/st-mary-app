import { adminAuth } from "@/firebase/firebase-admin";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";
import prisma from "@/lib/db";

// Returns fully populated user from SQL Server based on session cookie
const getCurrentUser = async () => {
    const cookieStore = await cookies();
    const session = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!session) {
        return null;
    }

    try {
        // 1. Verify Firebase Session
        const decodedToken = await adminAuth.verifySessionCookie(session, true);
        
        if (!decodedToken || !decodedToken.uid) {
            return null;
        }

        // 2. Fetch User from SQL Server
        const user = await prisma.ludiUser.findFirst({
            where: {
                firebaseUid: decodedToken.uid
            },
            include: {
                rol: true // Include Role details
            }
        });

        return user;
    } catch (error: any) {
        if (error?.errorInfo?.code === "auth/session-cookie-expired") {
            // Session expired
        } else {
            console.error("Error fetching current user:", error);
        }
        return null;
    }
};

export default getCurrentUser;
