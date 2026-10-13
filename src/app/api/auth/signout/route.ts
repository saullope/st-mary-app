import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
    try {
        await clearSessionCookie();
        return NextResponse.json({ message: "Session closed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error closing session:", error);
        return NextResponse.json({ error: "Failed to close session." }, { status: 500 });
    }
}
