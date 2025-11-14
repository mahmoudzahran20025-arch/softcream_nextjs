import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </p>
        <Link href="/" className="btn-primary px-6 py-2">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
