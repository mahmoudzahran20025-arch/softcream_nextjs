import { NextRequest, NextResponse } from 'next/server'
import { createSession, verifyUserCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        const user = await verifyUserCredentials(username, password)

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Create secure session
        await createSession(user)

        return NextResponse.json({
            success: true,
            user: {
                username: user.username,
                role: user.role,
                name: user.name
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
