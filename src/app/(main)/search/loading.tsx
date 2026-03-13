export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-[#e5e5e5] px-4 py-4 sticky top-0 bg-white">
        <div className="h-10 bg-[#e5e5e5] rounded-full animate-pulse" />
      </div>

      <div className="p-4 space-y-6 animate-pulse">
        {/* People section skeleton */}
        <div>
          <div className="h-5 w-16 bg-[#e5e5e5] rounded mb-3" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-2">
                <div className="w-10 h-10 rounded-full bg-[#e5e5e5] shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-[#e5e5e5] rounded w-24" />
                  <div className="h-3 bg-[#f0f0f0] rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Posts section skeleton */}
        <div>
          <div className="h-5 w-12 bg-[#e5e5e5] rounded mb-3" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-[#e5e5e5] rounded-lg p-3">
                <div className="flex gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#e5e5e5]" />
                  <div className="h-4 w-24 bg-[#e5e5e5] rounded" />
                </div>
                <div className="h-4 bg-[#e5e5e5] rounded w-full mb-2" />
                <div className="h-4 bg-[#e5e5e5] rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
