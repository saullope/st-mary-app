import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, PROTECTED_ROUTES } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;


    // Por segmento: "/view" no debe atrapar "/views" ni otras rutas con el mismo prefijo.
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // Protected route without session: redirect to login
    if (isProtectedRoute && !sessionCookie) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match protected routes
        '/dashboard/:path*',
        '/welcome-educator/:path*',
        '/create/:path*',
        '/settings/:path*',
        '/admin/:path*',
        '/views/:path*',
        '/view/:path*',
    ],
};

