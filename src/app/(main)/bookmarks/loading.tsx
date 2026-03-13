import { PostCardSkeleton } from '@/components/feed/PostCardSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="border-b border-[#e5e5e5] px-4 py-4 sticky top-0 bg-white">
        <h1 className="text-2xl font-bold text-[#1a1a1a] animate-pulse">Bookmarks</h1>
      </div>

      <div>
        {[...Array(5)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
