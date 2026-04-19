import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/lib/auth/constants";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname.startsWith(route)
    );

    // Check if route is public auth route (login/signup)
    const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

    // Protected route without session: redirect to login
    if (isProtectedRoute && !sessionCookie) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Auth routes with valid session: redirect to dashboard
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(new URL('/welcome-educator', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match protected routes
        '/dashboard/:path*',
        '/welcome-educator/:path*',
        '/create/:path*',
        // Match auth routes
        '/auth/login',
        '/auth/signup',
    ],
};

