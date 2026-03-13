'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type Tab = 'latest' | 'trending' | 'following'
type Window = 'hour' | 'day' | 'month' | 'year'

const WINDOWS: { label: string; value: Window }[] = [
  { label: 'Hour', value: 'hour' },
  { label: 'Day', value: 'day' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
]

export function FeedTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tab = (searchParams.get('tab') ?? 'latest') as Tab
  const window = (searchParams.get('window') ?? 'day') as Window

  const update = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  function setTab(t: Tab) {
    if (t === 'latest') {
      update({ tab: null, window: null })
    } else if (t === 'trending') {
      update({ tab: 'trending', window: searchParams.get('window') ?? 'day' })
    } else {
      update({ tab: 'following', window: null })
    }
  }

  function setWindow(w: Window) {
    update({ tab: 'trending', window: w })
  }

  return (
    <div className="bg-white border-b border-[#e5e5e5]">
      {/* Tab bar */}
      <div className="flex px-6">
        {(['latest', 'trending', 'following'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative py-4 mr-8 text-sm capitalize transition-colors ${
              tab === t
                ? 'text-[#1a1a1a]'
                : 'text-[#6b6b6b] hover:text-[#1a1a1a]'
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Time window pills (only when Trending tab is active) */}
      {tab === 'trending' && (
        <div className="flex items-center gap-2 px-6 pb-3">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              onClick={() => setWindow(w.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                window === w.value
                  ? 'bg-[#1a1a1a] text-white'
                  : 'border border-[#e5e5e5] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
