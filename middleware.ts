import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/travel-plans', '/explore', '/messages'];
  const adminRoutes = ['/admin'];

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (!session) {
    // Redirect to login if trying to access protected route
    if (isProtectedRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // Check for admin routes
    if (isAdminRoute && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect to dashboard if trying to access login/register
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
