import { ReactNode } from 'react'

export const metadata = {
    title: 'Admin Dashboard | SoftCream',
    description: 'Management interface',
}

export default function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Middleware handles protection, so we just render children */}
            {children}
        </div>
    )
}
