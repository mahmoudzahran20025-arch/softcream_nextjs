import { NextRequest, NextResponse } from 'next/server'
import { getSession, hasPermission } from '@/lib/auth'

// Allow all methods (GET, POST, PUT, DELETE)
export const dynamic = 'force-dynamic'

// Define the params type correctly for Next.js 15
type Props = {
    params: Promise<{ path: string[] }>
}

export async function GET(request: NextRequest, props: Props) {
    const params = await props.params;
    return handleProxy(request, params.path)
}

export async function POST(request: NextRequest, props: Props) {
    const params = await props.params;
    return handleProxy(request, params.path)
}

export async function PUT(request: NextRequest, props: Props) {
    const params = await props.params;
    return handleProxy(request, params.path)
}

export async function DELETE(request: NextRequest, props: Props) {
    const params = await props.params;
    return handleProxy(request, params.path)
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
    try {
        // 1. Authenticate & Authorize
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // "pathSegments" comes from [...path], e.g. ["orders", "123"] -> "/orders/123"
        // Clean up path structure to avoid double prefixes
        // If the pathSegments include 'admin' at the start unnecessarily, we might strip it?
        // But proxy is at /api/admin/[...path].
        // so url /api/admin/orders -> pathSegments = ['orders'].
        // apiPath = /orders.

        // User logs showed: /api/admin/admin/orders -> pathSegments = ['admin', 'orders'].
        // This creates apiPath = /admin/orders.
        // If backend expects /orders, this is wrong.

        // FIX: Normalize path. If first segment is 'admin' and this is unintended, remove it?
        // Let's stick to EXACT pathing relative to /api/admin first.

        const apiPath = `/${pathSegments.join('/')}`
        const method = request.method

        // Check RBAC Permissions
        if (!hasPermission(session.role, apiPath, method)) {
            console.warn(`[RBAC] Denied: ${session.username} (${session.role}) -> ${method} ${apiPath}`)
            return NextResponse.json(
                { error: 'Forbidden', message: `Role '${session.role}' cannot perform '${method}' on '${apiPath}'` },
                { status: 403 }
            )
        }

        // 2. Prepare Proxy Request
        const apiUrl = process.env.API_URL
        if (!apiUrl) {
            console.error('API_URL is not set')
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
        }

        const adminToken = process.env.ADMIN_TOKEN
        if (!adminToken) {
            console.error('ADMIN_TOKEN is not set')
            return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 })
        }

        // Construct backend URL
        const backendUrl = `${apiUrl}?path=${apiPath}`
        const queryString = request.nextUrl.searchParams.toString()
        const finalUrl = queryString ? `${backendUrl}&${queryString}` : backendUrl

        // Headers
        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('Authorization', `Bearer ${adminToken}`) // 💉 Inject Master Token

        // Body
        const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.text()

        // 3. Forward to Backend Worker
        const response = await fetch(finalUrl, {
            method,
            headers,
            body,
            // Important: backend might use self-signed certs or other quirks, usually fine for worker->worker
        })

        // 4. Return Response
        // We need to parse JSON to return a proper NextResponse, or stream it
        try {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        } catch (e) {
            // If backend returns non-JSON (void, empty, text)
            return new NextResponse(null, { status: response.status })
        }

    } catch (error) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ error: 'Proxy Error', details: String(error) }, { status: 500 })
    }
}
