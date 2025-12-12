'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        عذراً، حدث خطأ ما
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
                        نواجه مشكلة في عرض هذا المحتوى. يرجى المحاولة مرة أخرى.
                    </p>
                    {this.state.error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 text-xs text-left font-mono rounded-lg w-full max-w-lg overflow-auto max-h-40">
                            {this.state.error.toString()}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null })
                            window.location.reload()
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                    >
                        <RefreshCw size={18} />
                        إعادة تحميل الصفحة
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
