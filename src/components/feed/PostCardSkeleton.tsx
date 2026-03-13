export function PostCardSkeleton() {
  return (
    <div className="border-b border-[#e5e5e5] px-4 py-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-[#e5e5e5] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="h-4 w-24 bg-[#e5e5e5] rounded" />
            <div className="h-3 w-12 bg-[#e5e5e5] rounded" />
          </div>
          <div className="h-3 w-16 bg-[#f0f0f0] rounded mb-3" />
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-[#e5e5e5] rounded" />
            <div className="h-4 bg-[#e5e5e5] rounded" />
            <div className="h-4 w-3/4 bg-[#e5e5e5] rounded" />
          </div>
          <div className="flex gap-8 text-[#9b9b9b] text-sm">
            <div className="h-3 w-12 bg-[#f0f0f0] rounded" />
            <div className="h-3 w-12 bg-[#f0f0f0] rounded" />
            <div className="h-3 w-12 bg-[#f0f0f0] rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
