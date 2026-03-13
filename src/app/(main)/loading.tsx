import { PostCardSkeleton } from '@/components/feed/PostCardSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="border-b border-[#e5e5e5] px-4 py-4 h-16 bg-white animate-pulse" />
      <div className="border-b border-[#e5e5e5] px-4 py-3 h-12 bg-white animate-pulse" />
      <div>
        {[...Array(5)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
