export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="border-b border-[#e5e5e5] px-4 py-4 sticky top-0 bg-white">
        <h1 className="text-2xl font-bold text-[#1a1a1a] animate-pulse">Notifications</h1>
      </div>

      <div className="divide-y divide-[#e5e5e5]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-4 py-3 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e5e5e5] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[#e5e5e5] rounded w-48" />
                <div className="h-3 bg-[#f0f0f0] rounded w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
