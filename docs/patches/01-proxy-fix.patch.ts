/**
 * PATCH 01: Fix Admin Proxy Path Prefix
 * 
 * File: src/app/api/admin/[...path]/route.ts
 * 
 * PROBLEM:
 * The proxy sends `?path=/orders` but backend expects `?path=/admin/orders`
 * 
 * SOLUTION:
 * Prepend `/admin` to the path before forwarding to backend
 */

// ============================================
// BEFORE (Line ~50 in handleProxy function)
// ============================================
/*
const apiPath = `/${pathSegments.join('/')}`
*/

// ============================================
// AFTER
// ============================================
/*
const apiPath = `/admin/${pathSegments.join('/')}`
*/

// ============================================
// FULL FIXED handleProxy FUNCTION
// ============================================

/*
async function handleProxy(request: NextRequest, pathSegments: string[]) {
    try {
        // 1. Authenticate & Authorize
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // FIX: Prepend /admin to path for backend routing
        // pathSegments from [...path], e.g. ["orders", "123"] -> "/admin/orders/123"
        const apiPath = `/admin/${pathSegments.join('/')}`
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

        // Construct backend URL with /admin prefix
        const backendUrl = `${apiUrl}?path=${apiPath}`
        const queryString = request.nextUrl.searchParams.toString()
        const finalUrl = queryString ? `${backendUrl}&${queryString}` : backendUrl

        // Headers
        const headers = new Headers()
        headers.set('Content-Type', 'application/json')
        headers.set('Authorization', `Bearer ${adminToken}`)

        // Body
        const body = ['GET', 'HEAD'].includes(method) ? undefined : await request.text()

        // 3. Forward to Backend Worker
        const response = await fetch(finalUrl, {
            method,
            headers,
            body,
        })

        // 4. Return Response
        try {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        } catch (e) {
            return new NextResponse(null, { status: response.status })
        }

    } catch (error) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ error: 'Proxy Error', details: String(error) }, { status: 500 })
    }
}
*/

export {}
