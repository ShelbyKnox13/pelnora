import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export function middleware(request: NextRequest) {
  // Check if the request is for the admin section
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to the login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }

    // Check for admin authentication
    const adminAuthenticated = request.cookies.get('adminAuthenticated')?.value;
    const adminLastActivity = request.cookies.get('adminLastActivity')?.value;

    if (!adminAuthenticated || !adminLastActivity) {
      // For API routes, return 401
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
      // For other routes, redirect to login
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Check for session timeout (10 minutes)
    const lastActivity = parseInt(adminLastActivity);
    const now = Date.now();
    if (now - lastActivity > 10 * 60 * 1000) {
      // Clear admin session
      const response = request.nextUrl.pathname.startsWith('/api/admin')
        ? NextResponse.json({ message: 'Session expired' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin', request.url));
      
      if (!request.nextUrl.pathname.startsWith('/api/admin')) {
        response.cookies.delete('adminAuthenticated');
        response.cookies.delete('adminLastActivity');
      }
      return response;
    }

    // Update last activity timestamp
    const response = NextResponse.next();
    response.cookies.set('adminLastActivity', now.toString());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/user/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
}; 