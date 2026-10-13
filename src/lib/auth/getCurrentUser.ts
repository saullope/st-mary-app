import prisma from "@/lib/db";
import { readSessionClaims } from "./session";

// Returns fully populated user from SQL Server based on session cookie
const getCurrentUser = async () => {
    const claims = await readSessionClaims();
    if (!claims?.uid) return null;

    try {
        return await prisma.ludiUser.findFirst({
            where: { firebaseUid: claims.uid },
            include: { rol: true },
        });
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
};

export default getCurrentUser;
