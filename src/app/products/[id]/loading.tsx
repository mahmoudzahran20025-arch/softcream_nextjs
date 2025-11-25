export default function ProductLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl rounded-t-[2rem] md:rounded-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Image Skeleton */}
        <div className="md:w-1/2 aspect-square md:aspect-auto bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 animate-pulse" />
        
        {/* Content Skeleton */}
        <div className="flex-1 p-8 space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded-lg animate-pulse" />
            <div className="h-6 w-1/2 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded-lg animate-pulse" />
          </div>
          
          {/* Price */}
          <div className="h-10 w-32 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded-lg animate-pulse" />
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded animate-pulse" />
          </div>
          
          {/* Addons */}
          <div className="space-y-3">
            <div className="h-6 w-24 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-32 bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800/50 dark:to-purple-800/50 rounded-lg animate-pulse" />
            <div className="h-12 flex-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
