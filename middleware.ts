import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/server'

export async function middleware(request: NextRequest) {
  await updateSession(request)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

// Autoriser l'accès à cette page sans authentification
const PUBLIC_ROUTES = ['/verify-email'];