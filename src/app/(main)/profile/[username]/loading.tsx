import { PostCardSkeleton } from '@/components/feed/PostCardSkeleton'

export default function Loading() {
  return (
    <div>
      {/* Profile header skeleton */}
      <div className="border-b border-[#e5e5e5] px-4 py-6 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-[#e5e5e5]" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 bg-[#e5e5e5] rounded" />
            <div className="h-4 w-24 bg-[#f0f0f0] rounded" />
          </div>
        </div>
        <div className="h-4 bg-[#e5e5e5] rounded w-full mb-2" />
        <div className="h-4 bg-[#e5e5e5] rounded w-3/4" />
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-[#e5e5e5] px-4 py-3 flex gap-8 animate-pulse">
        <div className="h-4 w-20 bg-[#e5e5e5] rounded" />
        <div className="h-4 w-20 bg-[#f0f0f0] rounded" />
      </div>

      {/* Posts skeleton */}
      {[...Array(3)].map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
