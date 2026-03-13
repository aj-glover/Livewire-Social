export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-[#e5e5e5] px-4 py-4 sticky top-0 bg-white">
        <h1 className="text-2xl font-bold text-[#1a1a1a] animate-pulse">Messages</h1>
      </div>

      <div className="divide-y divide-[#e5e5e5]">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="px-4 py-3 animate-pulse hover:bg-[#fafafa]">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-full bg-[#e5e5e5] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-[#e5e5e5] rounded w-32 mb-1" />
                <div className="h-3 bg-[#f0f0f0] rounded w-48" />
              </div>
              <div className="h-3 w-10 bg-[#f0f0f0] rounded shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
