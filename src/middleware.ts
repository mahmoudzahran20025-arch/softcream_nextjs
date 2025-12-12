import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decryptSession } from './lib/auth'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // 1. Protect Admin Pages (/admin/*)
    // Exclude login page itself to prevent loop
    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const sessionToken = request.cookies.get('admin_session')?.value

        // Check if session exists and is valid
        const session = sessionToken ? await decryptSession(sessionToken) : null

        if (!session) {
            // Redirect to login
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            url.searchParams.set('from', path)
            return NextResponse.redirect(url)
        }
    }

    // 2. Protect Admin Proxy APIs (/api/admin/*)
    if (path.startsWith('/api/admin')) {
        const sessionToken = request.cookies.get('admin_session')?.value
        const session = sessionToken ? await decryptSession(sessionToken) : null

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Invalid or expired session' },
                { status: 401 }
            )
        }

        // Role-based access control inside the API route itself (or added here if we want early rejection)
        // For now, we just ensure they are logged in. granular permission checks happen in the route handler.
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*'
    ]
}
