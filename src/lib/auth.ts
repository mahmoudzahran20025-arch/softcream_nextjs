import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// ==========================================
// Types
// ==========================================

export type Role = 'superadmin' | 'admin' | 'operator'

export interface User {
    username: string
    role: Role
    name?: string
}

export interface SessionPayload {
    username: string
    role: Role
    exp: number
}

// ==========================================
// Constants
// ==========================================

const SESSION_COOKIE_NAME = 'admin_session'
const DEFAULT_SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

// ==========================================
// Environment Helpers
// ==========================================

function getSessionSecret() {
    const secret = process.env.SESSION_SECRET
    if (!secret) {
        if (process.env.NODE_ENV === 'development') {
            return new TextEncoder().encode('dev-secret-key-must-be-32-chars-long!!')
        }
        throw new Error('SESSION_SECRET environment variable is not set')
    }
    return new TextEncoder().encode(secret)
}

function getAdminUsers(): Record<string, { password: string, role: string, name?: string }> {
    try {
        const usersJson = process.env.ADMIN_USERS
        if (!usersJson) return {}
        const users = JSON.parse(usersJson)
        // Convert array to map for O(1) lookup: [ {username...} ] -> { "username": {...} }
        return users.reduce((acc: any, user: any) => {
            acc[user.username] = user
            return acc
        }, {})
    } catch (error) {
        console.error('Failed to parse ADMIN_USERS env var', error)
        return {}
    }
}

// ==========================================
// Session Management
// ==========================================

export async function encryptSession(payload: Omit<SessionPayload, 'exp'>) {
    const secret = getSessionSecret()
    const success = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)
    return success
}

export async function decryptSession(token: string): Promise<SessionPayload | null> {
    try {
        const secret = getSessionSecret()
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionPayload
    } catch (error) {
        return null
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null
    return decryptSession(token)
}

export async function createSession(user: Omit<User, 'password'>) {
    const expires = new Date(Date.now() + DEFAULT_SESSION_DURATION)
    const session = await encryptSession({ username: user.username, role: user.role })
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE_NAME, session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    })
}

export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
}

// ==========================================
// RBAC Permission Logic
// ==========================================

// Matrix: Path Pattern -> Allowed Roles
// If a path isn't listed, it defaults to NO ACCESS (allowlist approach) or superadmin only
// Method: * means all methods
type PermissionRule = {
    roles: Role[]
    methods: string[] // 'GET', 'POST', 'PUT', 'DELETE' or '*'
}

const PERMISSION_MATRIX: Record<string, PermissionRule> = {
    // Read-only access for Operators
    '/orders': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/orders/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },
    '/stats': { roles: ['superadmin', 'admin', 'operator'], methods: ['GET'] },

    // Write access for Admins
    '/orders/:id': { roles: ['superadmin', 'admin'], methods: ['PUT', 'POST', 'DELETE'] },
    '/products': { roles: ['superadmin', 'admin'], methods: ['*'] },
    '/coupons': { roles: ['superadmin', 'admin'], methods: ['*'] },

    // SuperAdmin Only
    '/users': { roles: ['superadmin'], methods: ['*'] },
    '/settings': { roles: ['superadmin'], methods: ['*'] },
}

export function hasPermission(role: Role, path: string, method: string): boolean {
    if (role === 'superadmin') return true

    // Normalize path (remove query params, etc) - simple implementation
    // Ideally use a proper route matcher, but for now strict prefix or exact match

    // 1. Check direct matches
    for (const [routePattern, rule] of Object.entries(PERMISSION_MATRIX)) {
        // Simple verification: check if path starts with routePattern
        // This is a naive implementation, can be improved with regex
        // For /orders, it matches /orders, /orders/123, etc.
        if (path.startsWith(routePattern) || (routePattern.endsWith('/*') && path.startsWith(routePattern.slice(0, -2)))) {
            const isRoleAllowed = rule.roles.includes(role)
            const isMethodAllowed = rule.methods.includes('*') || rule.methods.includes(method.toUpperCase())

            if (isRoleAllowed && isMethodAllowed) return true
        }
    }

    // Fallback for sub-routes not explicitly defined but parent is?
    // For now, deny by default if not strictly matched or superadmin
    return false
}

export async function verifyUserCredentials(username: string, password: string): Promise<User | null> {
    const users = getAdminUsers()
    const user = users[username]

    if (user && user.password === password) {
        return {
            username,
            role: user.role as Role,
            name: user.name
        }
    }
    return null
}
