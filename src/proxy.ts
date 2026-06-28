import { NextRequest, NextResponse } from 'next/server';

// Routes requiring authentication
const STUDENT_ROUTES = ['/dashboard', '/profile'];
const COMPANY_ROUTES = [
  '/company/dashboard',
  '/company/internships',
  '/company/settings',
  '/company/onboarding',
];
const AUTH_ROUTES = [
  '/get-started',
  '/signup',
  '/login',
  '/confirm-email',
  '/forgot-password',
  '/reset-password',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read tokens from cookies (set on login via authSlice)
  const accessToken = request.cookies.get('tadrebk_access_token')?.value;
  const userRole = request.cookies.get('tadrebk_user_role')?.value;
  const isAuthenticated = !!accessToken;

  // ── Redirect authenticated users away from auth pages ──────
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const dest = userRole === 'company' ? '/company/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Protect student routes ──────────────────────────────────
  if (STUDENT_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login/student', request.url));
    }
    if (userRole === 'company') {
      return NextResponse.redirect(new URL('/company/dashboard', request.url));
    }
  }

  // ── Protect company routes ──────────────────────────────────
  if (COMPANY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login/company', request.url));
    }
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
