import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes: check for Supabase auth session cookie
  if (pathname.startsWith('/admin')) {
    const authCookie =
      request.cookies.get('sb-access-token') ||
      request.cookies.get('supabase-auth-token') ||
      // Supabase v2 session cookie pattern
      [...request.cookies.getAll()].find(
        (c) =>
          c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
      )

    if (!authCookie) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
