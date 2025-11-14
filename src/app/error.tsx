'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          حدث خطأ ما!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          عذراً، حدثت مشكلة أثناء تحميل الصفحة
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary px-6 py-2"
        >
          حاول مرة أخرى
        </button>
      </div>
    </div>
  )
}
