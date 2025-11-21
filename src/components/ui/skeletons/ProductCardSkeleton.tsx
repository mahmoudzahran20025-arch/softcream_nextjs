'use client'

export default function ProductCardSkeleton() {
  return (
    <div className="card p-3 h-full flex flex-col animate-pulse">
      {/* Image Skeleton - Fixed Aspect Ratio */}
      <div className="relative w-full aspect-[4/5] bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />

      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col space-y-2">
        {/* Title */}
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        
        {/* Description */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        
        {/* Calories */}
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
        {/* Price */}
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        
        {/* Quantity Controls */}
        <div className="flex items-center gap-1">
          <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        
        {/* Add Button */}
        <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}
