import { NextRequest, NextResponse } from 'next/server';

// Routes requiring authentication
const STUDENT_ROUTES = ['/dashboard', '/profile', '/my-applications', '/activity', '/onboarding'];
const COMPANY_ROUTES = [
  '/company/admin',
  '/company/internships',
  '/company/settings',
  '/company/onboarding',
  '/company/activity',
];
const ADMIN_ROUTES = ['/admin/dashboard'];
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

  const accessToken = request.cookies.get('tadrebk_access_token')?.value;
  const userRole = request.cookies.get('tadrebk_user_role')?.value;
  const isAuthenticated = !!accessToken;

  // â”€â”€ Redirect authenticated users away from auth pages â”€â”€â”€â”€â”€â”€
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const dest =
      userRole === 'company' ? '/company/admin' :
      userRole === 'admin' ? '/admin/dashboard' :
      '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // â”€â”€ Protect student routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (STUDENT_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login/student', request.url));
    }
    // Redirect admin users away from student routes
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // â”€â”€ Protect company routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (COMPANY_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login/company', request.url));
    }
  }

  // â”€â”€ Protect admin routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login/student', request.url));
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
