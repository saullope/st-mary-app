import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export async function POST() {
    try {
        cookies().set({
            name: AUTH_COOKIE_NAME,
            value: "",
            maxAge: 0,
            path: "/",
        });

        return NextResponse.json({ message: "Session closed successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error closing session:", error);
        return NextResponse.json({ error: "Failed to close session." }, { status: 500 });
    }
}