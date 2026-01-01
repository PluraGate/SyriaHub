import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton rounded-md', // Uses shimmer animation from globals.css
        className
      )}
      {...props}
    />
  )
}

export function PostCardSkeleton() {
  return (
    <div className="card p-6">
      <Skeleton className="h-7 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

// Enhanced feed card skeleton with image preview area
export function FeedCardSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden">
      {/* Optional image area */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {/* Title */}
        <Skeleton className="h-6 w-4/5 mb-3" />
        {/* Description */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        {/* Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-dark-border">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </div>
    </div>
  )
}

// Compact feed card skeleton (no image)
export function FeedCardSkeletonCompact() {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-100 dark:border-dark-border p-5">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </div>
      {/* Title */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      {/* Description */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-18 rounded-full" />
      </div>
    </div>
  )
}

// Notification item skeleton
export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100 dark:border-dark-border">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
    </div>
  )
}

// Profile header skeleton with cover image
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden mb-8">
      {/* Cover image */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6 md:p-8 -mt-16">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <Skeleton className="w-32 h-32 rounded-full border-4 border-white dark:border-dark-surface" />
          {/* Info */}
          <div className="flex-1 w-full pt-4">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-4 w-full max-w-xl mb-2" />
            <Skeleton className="h-4 w-3/4 max-w-lg mb-6" />
            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-10 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start gap-8 mb-12">
        <Skeleton className="w-32 h-32 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-9 w-64 mb-3" />
          <Skeleton className="h-5 w-full max-w-2xl mb-2" />
          <Skeleton className="h-5 w-3/4 mb-4" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
