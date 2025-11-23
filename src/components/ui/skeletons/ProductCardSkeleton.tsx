'use client'

export default function ProductCardSkeleton() {
  return (
    <div className="card p-3 h-full flex flex-col" style={{ willChange: 'opacity' }}>
      {/* Image Skeleton - Fixed Aspect Ratio */}
      <div className="relative w-full aspect-[4/5] bg-slate-200 dark:bg-slate-700 rounded-lg mb-3 animate-pulse" />

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
      <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700">
        {/* Price Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
        
        {/* Action Buttons - Two Rows */}
        <div className="flex flex-col gap-1.5">
          {/* Row 1: Quantity Selector */}
          <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          
          {/* Row 2: Cart Icon + Learn More */}
          <div className="flex items-center gap-1.5">
            <div className="flex-shrink-0 w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
